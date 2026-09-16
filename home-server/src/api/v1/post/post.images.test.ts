import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST_CONTENT_NAME, PostImage } from "@home/shared";
import {
  ApiMessage,
  imageNameTaken,
  inlineImageNotOnPost,
} from "../http/messages";
import {
  deletePostStorage,
  FULL_SIZE_IMAGES_DIRECTORY,
} from "../fileOperations/postStorage";
import { StoredPostRevision } from "../types/db";
import {
  afterEachPostTest,
  apiCall,
  avifImage,
  beforeEachPostTest,
  CONTENT,
  createPost,
  currentRevision,
  expectFailure,
  GIF_IMAGE,
  HEADER_IMAGE_NAME,
  headerImageFile,
  headerImageResponse,
  imagePath,
  imageResponse,
  JPEG_IMAGE,
  LONGER_PNG_IMAGE,
  MISSING_POST_ID,
  OTHER_PNG_IMAGE,
  PNG_IMAGE,
  postImage,
  postPath,
  postResponse,
  postWithHeaderImage,
  postWithoutHeaderImage,
  publishPost,
  responsePost,
  savedPosts,
  storedEntries,
  storedFile,
  storedInode,
  storedUploads,
  stubPostLookup,
  TITLE,
  updatePost,
  WEBP_IMAGE,
} from "../testFixtures/postTestFixtures";

type SavedPost = (typeof savedPosts)[number];

const THUMBNAILS_DIRECTORY = "thumbnails";

const DIAGRAM = "diagram.png";

const CHART = "chart.jpg";

const IMAGE_TYPES: [string, Buffer, string][] = [
  [DIAGRAM, PNG_IMAGE, "image/png"],
  ["screenshot.jpg", JPEG_IMAGE, "image/jpeg"],
  ["photo.jpeg", JPEG_IMAGE, "image/jpeg"],
  ["chart.webp", WEBP_IMAGE, "image/webp"],
  ["photo.avif", avifImage("avif"), "image/avif"],
  ["sequence.avif", avifImage("avis"), "image/avif"],
  ["loop.gif", GIF_IMAGE, "image/gif"],
];

const IMAGE_ROUTES: [string, "" | "/fullSize"][] = [
  ["the image route", ""],
  ["the full size image route", "/fullSize"],
];

const postWithHeaderAndDiagram = () =>
  postWithHeaderImage({ inlineImages: [postImage(DIAGRAM, PNG_IMAGE)] });

const postWithHeaderDiagramAndChart = () =>
  postWithHeaderImage({
    inlineImages: [postImage(DIAGRAM, PNG_IMAGE), postImage(CHART, JPEG_IMAGE)],
  });

const imageNames = (images: PostImage[]) => images.map((image) => image.name);

const inlineImageNames = (post: SavedPost) =>
  currentRevision(post).inlineImages.map((image) => image.name);

const editPost = (post: SavedPost, body: object) =>
  apiCall("patch", postPath(post), { body });

const getImage = (post: SavedPost, name: string, size: "" | "/fullSize" = "") =>
  apiCall("get", imagePath(post, name, size));

describe("images on a blog post", () => {
  beforeEach(beforeEachPostTest);

  afterEach(afterEachPostTest);

  describe("POST /api/v1/posts", () => {
    it("stores the header image and every inline image", async () => {
      const response = await createPost(postWithHeaderDiagramAndChart());

      const post = savedPosts[0];
      const postId = post._id.toString();
      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_CREATED,
        post: postResponse(post, {
          inlineImages: [
            imageResponse(postId, DIAGRAM, PNG_IMAGE, "image/png"),
            imageResponse(postId, CHART, JPEG_IMAGE, "image/jpeg"),
          ],
        }),
      });

      await expect(storedFile(headerImageFile(revision))).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(revision.inlineImages[0].file)).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(revision.inlineImages[1].file)).resolves.toEqual(
        JPEG_IMAGE,
      );
    });

    it("publishes a post that has a header image and no inline images", async () => {
      const response = await createPost(postWithHeaderImage());

      const post = savedPosts[0];

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toEqual(
        headerImageResponse(post._id.toString()),
      );
      expect(responsePost(response).inlineImages).toEqual([]);
    });

    it("publishes a post that has inline images and no header image", async () => {
      const response = await createPost(
        postWithoutHeaderImage({
          inlineImages: [postImage(DIAGRAM, PNG_IMAGE)],
        }),
      );

      const post = savedPosts[0];

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toBeNull();
      expect(responsePost(response).inlineImages).toEqual([
        imageResponse(post._id.toString(), DIAGRAM, PNG_IMAGE, "image/png"),
      ]);
      expect(currentRevision(post).headerImage).toBeUndefined();
    });

    it("stores a revision's images in its full size images folder", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());
      const revision = currentRevision(post);
      const directory = path.posix.dirname(revision.content.file);
      const images = path.posix.join(directory, FULL_SIZE_IMAGES_DIRECTORY);

      expect((await storedEntries(directory)).sort()).toEqual(
        [
          `${POST_CONTENT_NAME}.md`,
          FULL_SIZE_IMAGES_DIRECTORY,
          THUMBNAILS_DIRECTORY,
        ].sort(),
      );
      expect(headerImageFile(revision)).toBe(
        path.posix.join(images, HEADER_IMAGE_NAME),
      );
      expect(revision.inlineImages[0].file).toBe(
        path.posix.join(images, DIAGRAM),
      );
      expect((await storedEntries(images)).sort()).toEqual(
        [DIAGRAM, HEADER_IMAGE_NAME].sort(),
      );
    });

    it.each(IMAGE_TYPES)(
      "stores %s as an inline image",
      async (name, data, contentType) => {
        const response = await createPost(
          postWithoutHeaderImage({ inlineImages: [postImage(name, data)] }),
        );

        expect(response.status).toBe(200);
        expect(responsePost(response).inlineImages).toEqual([
          imageResponse(savedPosts[0]._id.toString(), name, data, contentType),
        ]);
      },
    );

    it.each(IMAGE_TYPES)(
      "stores and serves %s as a header image",
      async (name, data, contentType) => {
        const post = await publishPost(
          postWithHeaderImage({ headerImage: postImage(name, data) }),
        );

        const response = await getImage(post, name);

        expect(currentRevision(post).headerImage?.contentType).toBe(
          contentType,
        );
        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toBe(contentType);
        expect(response.body).toEqual(data);
      },
    );
  });

  describe("GET /api/v1/posts/:id", () => {
    it("returns the post with its header image and inline images", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await apiCall("get", postPath(post));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        post: postResponse(post, {
          inlineImages: [
            imageResponse(post._id.toString(), DIAGRAM, PNG_IMAGE, "image/png"),
          ],
        }),
      });
    });
  });

  describe("PATCH /api/v1/posts/:id, the header image", () => {
    it("adds a header image to a post that has none", async () => {
      const post = await publishPost(postWithoutHeaderImage());

      const response = await updatePost(post, {
        headerImage: postImage(HEADER_IMAGE_NAME, PNG_IMAGE),
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toEqual(
        headerImageResponse(post._id.toString()),
      );

      await expect(
        storedFile(headerImageFile(currentRevision(post))),
      ).resolves.toEqual(PNG_IMAGE);
      expect((await getImage(post, HEADER_IMAGE_NAME)).body).toEqual(PNG_IMAGE);
    });

    it("replaces the header image with one of a different name", async () => {
      const post = await publishPost();

      const response = await updatePost(post, {
        headerImage: postImage("cover.jpg", JPEG_IMAGE),
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toEqual(
        imageResponse(
          post._id.toString(),
          "cover.jpg",
          JPEG_IMAGE,
          "image/jpeg",
        ),
      );

      await expect(
        storedFile(headerImageFile(currentRevision(post))),
      ).resolves.toEqual(JPEG_IMAGE);
      expect((await getImage(post, "cover.jpg")).body).toEqual(JPEG_IMAGE);
      expect((await getImage(post, HEADER_IMAGE_NAME)).status).toBe(404);
    });

    it("replaces the header image with one of the same name", async () => {
      const post = await publishPost();
      const previous = currentRevision(post);

      const response = await updatePost(post, {
        headerImage: postImage(HEADER_IMAGE_NAME, LONGER_PNG_IMAGE),
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toEqual(
        imageResponse(
          post._id.toString(),
          HEADER_IMAGE_NAME,
          LONGER_PNG_IMAGE,
          "image/png",
        ),
      );

      await expect(
        storedFile(headerImageFile(currentRevision(post))),
      ).resolves.toEqual(LONGER_PNG_IMAGE);
      await expect(storedFile(headerImageFile(previous))).resolves.toEqual(
        PNG_IMAGE,
      );
      expect((await getImage(post, HEADER_IMAGE_NAME)).body).toEqual(
        LONGER_PNG_IMAGE,
      );
    });

    it("removes the header image when it is sent as null", async () => {
      const post = await publishPost();

      const response = await updatePost(post, { removeHeaderImage: true });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toBeNull();
      expect(currentRevision(post).headerImage).toBeUndefined();
      expect(
        responsePost(await apiCall("get", postPath(post))).headerImage,
      ).toBeNull();
    });

    it("accepts removing the header image from a post that has none", async () => {
      const post = await publishPost(postWithoutHeaderImage());

      const response = await updatePost(post, { removeHeaderImage: true });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toBeNull();
    });

    it.each([
      ["the content", { content: "# Take two\n" }],
      ["the inline images", { removeInlineImages: [DIAGRAM] }],
    ])(
      "carries the header image forward when an edit only changes %s",
      async (_description, body) => {
        const post = await publishPost(postWithHeaderAndDiagram());
        const previous = currentRevision(post);

        const response = await editPost(post, body);

        expect(response.status).toBe(200);
        expect(responsePost(response).headerImage).toEqual(
          headerImageResponse(post._id.toString()),
        );
        expect(await storedInode(headerImageFile(currentRevision(post)))).toBe(
          await storedInode(headerImageFile(previous)),
        );
      },
    );

    it("refuses to remove the header image and upload a new one at once, keeping the upload for a retry", async () => {
      const post = await publishPost();

      expectFailure(
        await updatePost(post, {
          headerImage: postImage("cover.jpg", JPEG_IMAGE),
          removeHeaderImage: true,
        }),
        400,
        ApiMessage.POST_HEADER_IMAGE_REMOVED_AND_UPLOADED,
      );
      expect(post.revisions).toHaveLength(1);

      const uploads = await storedUploads();
      expect(uploads).toHaveLength(1);

      const retried = await editPost(post, { uploadId: uploads[0] });

      expect(retried.status).toBe(200);
      expect(responsePost(retried).headerImage?.name).toBe("cover.jpg");
      await expect(storedUploads()).resolves.toEqual([]);
    });
  });

  describe("PATCH /api/v1/posts/:id, inline images", () => {
    it("adds inline images to a post that has no images", async () => {
      const post = await publishPost(postWithoutHeaderImage());

      const response = await updatePost(post, {
        inlineImages: [
          postImage(DIAGRAM, PNG_IMAGE),
          postImage(CHART, JPEG_IMAGE),
        ],
      });

      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toBeNull();
      expect(imageNames(responsePost(response).inlineImages)).toEqual([
        DIAGRAM,
        CHART,
      ]);

      await expect(storedFile(revision.inlineImages[0].file)).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(revision.inlineImages[1].file)).resolves.toEqual(
        JPEG_IMAGE,
      );
    });

    it("adds inline images alongside the ones already on the post", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await updatePost(post, {
        inlineImages: [postImage(CHART, JPEG_IMAGE)],
      });

      expect(response.status).toBe(200);
      expect(imageNames(responsePost(response).inlineImages)).toEqual([
        DIAGRAM,
        CHART,
      ]);
    });

    it("replaces an inline image with one of the same name", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());
      const previous = currentRevision(post);

      const response = await updatePost(post, {
        inlineImages: [postImage(DIAGRAM, LONGER_PNG_IMAGE)],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).inlineImages).toEqual([
        imageResponse(
          post._id.toString(),
          DIAGRAM,
          LONGER_PNG_IMAGE,
          "image/png",
        ),
      ]);

      await expect(
        storedFile(currentRevision(post).inlineImages[0].file),
      ).resolves.toEqual(LONGER_PNG_IMAGE);
      await expect(storedFile(previous.inlineImages[0].file)).resolves.toEqual(
        PNG_IMAGE,
      );
    });

    it("replaces an inline image uploaded under a differently cased name", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await updatePost(post, {
        inlineImages: [postImage("Diagram.png", LONGER_PNG_IMAGE)],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).inlineImages).toEqual([
        imageResponse(
          post._id.toString(),
          "Diagram.png",
          LONGER_PNG_IMAGE,
          "image/png",
        ),
      ]);
      expect((await getImage(post, "Diagram.png")).body).toEqual(
        LONGER_PNG_IMAGE,
      );
    });

    it("replaces an inline image that the same edit also removes", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await updatePost(post, {
        inlineImages: [postImage(DIAGRAM, LONGER_PNG_IMAGE)],
        removeInlineImages: [DIAGRAM],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).inlineImages).toEqual([
        imageResponse(
          post._id.toString(),
          DIAGRAM,
          LONGER_PNG_IMAGE,
          "image/png",
        ),
      ]);
    });

    it("removes an inline image", async () => {
      const post = await publishPost(postWithHeaderDiagramAndChart());

      const response = await editPost(post, { removeInlineImages: [DIAGRAM] });

      expect(response.status).toBe(200);
      expect(imageNames(responsePost(response).inlineImages)).toEqual([CHART]);
    });

    it("removes an inline image whose name is cased differently", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await editPost(post, {
        removeInlineImages: ["Diagram.png"],
      });

      expect(response.status).toBe(200);
      expect(inlineImageNames(post)).toEqual([]);
    });

    it("removes every inline image and keeps the header image", async () => {
      const post = await publishPost(postWithHeaderDiagramAndChart());

      const response = await editPost(post, {
        removeInlineImages: [DIAGRAM, CHART],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).inlineImages).toEqual([]);
      expect(responsePost(response).headerImage).toEqual(
        headerImageResponse(post._id.toString()),
      );
    });

    it("removes every inline image from a post without a header image", async () => {
      const post = await publishPost(
        postWithoutHeaderImage({
          inlineImages: [
            postImage(DIAGRAM, PNG_IMAGE),
            postImage(CHART, JPEG_IMAGE),
          ],
        }),
      );

      const response = await editPost(post, {
        removeInlineImages: [DIAGRAM, CHART],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response)).toMatchObject({
        title: TITLE,
        content: CONTENT,
        headerImage: null,
        inlineImages: [],
      });
    });

    it("accepts an empty list of inline images to remove alongside another change", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await editPost(post, {
        title: "Take two",
        removeInlineImages: [],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).title).toBe("Take two");
      expect(inlineImageNames(post)).toEqual([DIAGRAM]);
    });

    it("swaps one inline image for another and keeps the header image", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await updatePost(post, {
        inlineImages: [postImage(CHART, JPEG_IMAGE)],
        removeInlineImages: [DIAGRAM],
      });

      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(responsePost(response).inlineImages).toEqual([
        imageResponse(post._id.toString(), CHART, JPEG_IMAGE, "image/jpeg"),
      ]);

      await expect(storedFile(headerImageFile(revision))).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(revision.inlineImages[0].file)).resolves.toEqual(
        JPEG_IMAGE,
      );
    });

    it("refuses to remove an inline image that is not on the post, keeping the upload", async () => {
      const post = await publishPost();

      expectFailure(
        await updatePost(post, {
          inlineImages: [postImage(CHART, JPEG_IMAGE)],
          removeInlineImages: [DIAGRAM],
        }),
        400,
        inlineImageNotOnPost(DIAGRAM),
      );
      expect(post.revisions).toHaveLength(1);
      await expect(storedUploads()).resolves.toHaveLength(1);
    });

    it("refuses to remove the header image through the inline images", async () => {
      const post = await publishPost();

      expectFailure(
        await editPost(post, { removeInlineImages: [HEADER_IMAGE_NAME] }),
        400,
        inlineImageNotOnPost(HEADER_IMAGE_NAME),
      );
      expect(post.revisions).toHaveLength(1);
    });
  });

  describe("PATCH /api/v1/posts/:id, image names", () => {
    it.each([HEADER_IMAGE_NAME, "Cover.png"])(
      "refuses an inline image named %s alongside the header image, keeping the upload",
      async (name) => {
        const post = await publishPost();

        expectFailure(
          await updatePost(post, {
            inlineImages: [postImage(name, PNG_IMAGE)],
          }),
          400,
          imageNameTaken(name),
        );
        expect(post.revisions).toHaveLength(1);
        await expect(storedUploads()).resolves.toHaveLength(1);
      },
    );

    it("refuses a header image named like an inline image", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      expectFailure(
        await updatePost(post, { headerImage: postImage(DIAGRAM, PNG_IMAGE) }),
        400,
        imageNameTaken(DIAGRAM),
      );
      expect(post.revisions).toHaveLength(1);
    });

    it("accepts a header image named like an inline image that is going away", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await updatePost(post, {
        headerImage: postImage(DIAGRAM, PNG_IMAGE),
        removeInlineImages: [DIAGRAM],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toEqual(
        imageResponse(post._id.toString(), DIAGRAM, PNG_IMAGE, "image/png"),
      );
      expect(responsePost(response).inlineImages).toEqual([]);
    });

    it("accepts an inline image named like a header image that is going away", async () => {
      const post = await publishPost();

      const response = await updatePost(post, {
        removeHeaderImage: true,
        inlineImages: [postImage(HEADER_IMAGE_NAME, OTHER_PNG_IMAGE)],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toBeNull();
      expect(responsePost(response).inlineImages).toEqual([
        imageResponse(
          post._id.toString(),
          HEADER_IMAGE_NAME,
          OTHER_PNG_IMAGE,
          "image/png",
        ),
      ]);
      expect((await getImage(post, HEADER_IMAGE_NAME)).body).toEqual(
        OTHER_PNG_IMAGE,
      );
    });

    it("accepts an inline image named like the header image it replaces under a new name", async () => {
      const post = await publishPost();

      const response = await updatePost(post, {
        headerImage: postImage("banner.jpg", JPEG_IMAGE),
        inlineImages: [postImage(HEADER_IMAGE_NAME, OTHER_PNG_IMAGE)],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage?.name).toBe("banner.jpg");
      expect(imageNames(responsePost(response).inlineImages)).toEqual([
        HEADER_IMAGE_NAME,
      ]);
    });
  });

  describe("PATCH /api/v1/posts/:id, several changes at once", () => {
    it("removes the header image and every inline image at once and keeps them in the earlier revision", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());
      const previous = currentRevision(post);

      const response = await updatePost(post, {
        removeHeaderImage: true,
        removeInlineImages: [DIAGRAM],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response)).toMatchObject({
        title: TITLE,
        content: CONTENT,
        headerImage: null,
        inlineImages: [],
      });

      await expect(storedFile(headerImageFile(previous))).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(previous.inlineImages[0].file)).resolves.toEqual(
        PNG_IMAGE,
      );
    });

    it("changes the title, the content and every image at once", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      const response = await updatePost(post, {
        title: "Take two",
        content: "# Take two\n",
        headerImage: postImage("banner.jpg", JPEG_IMAGE),
        inlineImages: [postImage(CHART, JPEG_IMAGE)],
        removeInlineImages: [DIAGRAM],
      });

      expect(response.status).toBe(200);
      expect(responsePost(response)).toMatchObject({
        title: "Take two",
        content: "# Take two\n",
        headerImage: imageResponse(
          post._id.toString(),
          "banner.jpg",
          JPEG_IMAGE,
          "image/jpeg",
        ),
        inlineImages: [
          imageResponse(post._id.toString(), CHART, JPEG_IMAGE, "image/jpeg"),
        ],
      });
    });

    it("links the files it carries forward instead of copying them", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());
      const previous = currentRevision(post);

      const response = await editPost(post, { title: "Take two" });

      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(responsePost(response).content).toBe(CONTENT);

      for (const [file, original] of [
        [revision.content.file, previous.content.file],
        [headerImageFile(revision), headerImageFile(previous)],
        [revision.inlineImages[0].file, previous.inlineImages[0].file],
      ]) {
        expect(file).not.toBe(original);
        expect(await storedInode(file)).toBe(await storedInode(original));
      }
    });
  });

  describe("PATCH /api/v1/posts/:id, every header and inline image change together", () => {
    const LOOP = "loop.gif";

    const HEADER_CHANGES = {
      keeps: { hasHeader: true, request: {}, bytes: PNG_IMAGE },
      adds: {
        hasHeader: false,
        request: { headerImage: postImage(HEADER_IMAGE_NAME, PNG_IMAGE) },
        bytes: PNG_IMAGE,
      },
      replaces: {
        hasHeader: true,
        request: {
          headerImage: postImage(HEADER_IMAGE_NAME, LONGER_PNG_IMAGE),
        },
        bytes: LONGER_PNG_IMAGE,
      },
      removes: {
        hasHeader: true,
        request: { removeHeaderImage: true },
        bytes: undefined,
      },
    };

    const INLINE_CHANGES = {
      keeps: { request: {}, names: [CHART, DIAGRAM], diagram: PNG_IMAGE },
      adds: {
        request: { inlineImages: [postImage(LOOP, GIF_IMAGE)] },
        names: [CHART, DIAGRAM, LOOP],
        diagram: PNG_IMAGE,
      },
      replaces: {
        request: { inlineImages: [postImage(DIAGRAM, LONGER_PNG_IMAGE)] },
        names: [CHART, DIAGRAM],
        diagram: LONGER_PNG_IMAGE,
      },
      removes: {
        request: { removeInlineImages: [DIAGRAM] },
        names: [CHART],
        diagram: undefined,
      },
    };

    const COMBINATIONS = Object.keys(HEADER_CHANGES).flatMap((header) =>
      Object.keys(INLINE_CHANGES).map(
        (inline) =>
          [
            header as keyof typeof HEADER_CHANGES,
            inline as keyof typeof INLINE_CHANGES,
          ] as const,
      ),
    );

    const storedInlineImage = (revision: StoredPostRevision, name: string) =>
      revision.inlineImages.find((image) => image.name === name);

    it.each(COMBINATIONS)(
      "%s the header image and %s an inline image in one edit",
      async (header, inline) => {
        const headerChange = HEADER_CHANGES[header];
        const inlineChange = INLINE_CHANGES[inline];
        const inlineImages = [
          postImage(DIAGRAM, PNG_IMAGE),
          postImage(CHART, JPEG_IMAGE),
        ];
        const post = await publishPost(
          headerChange.hasHeader
            ? postWithHeaderImage({ inlineImages })
            : postWithoutHeaderImage({ inlineImages }),
        );
        const previous = currentRevision(post);

        const response = await updatePost(post, {
          title: "Take two",
          ...headerChange.request,
          ...inlineChange.request,
        });

        const revision = currentRevision(post);
        const edited = responsePost(response);

        expect(response.status).toBe(200);
        expect(edited.title).toBe("Take two");
        expect(edited.headerImage).toEqual(
          headerChange.bytes
            ? imageResponse(
                post._id.toString(),
                HEADER_IMAGE_NAME,
                headerChange.bytes,
                "image/png",
              )
            : null,
        );
        expect(imageNames(edited.inlineImages).sort()).toEqual(
          inlineChange.names,
        );

        if (headerChange.bytes) {
          await expect(storedFile(headerImageFile(revision))).resolves.toEqual(
            headerChange.bytes,
          );
        }

        if (header === "keeps") {
          expect(await storedInode(headerImageFile(revision))).toBe(
            await storedInode(headerImageFile(previous)),
          );
        }

        const diagram = storedInlineImage(revision, DIAGRAM);

        if (inlineChange.diagram) {
          await expect(storedFile(diagram?.file ?? "")).resolves.toEqual(
            inlineChange.diagram,
          );
        } else {
          expect(diagram).toBeUndefined();
        }

        expect(
          await storedInode(storedInlineImage(revision, CHART)?.file ?? ""),
        ).toBe(
          await storedInode(storedInlineImage(previous, CHART)?.file ?? ""),
        );
      },
    );
  });

  describe("GET /api/v1/posts/:id/images/:name", () => {
    it("returns the header image by name with its caching headers", async () => {
      const post = await publishPost();

      const response = await getImage(post, HEADER_IMAGE_NAME);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("image/png");
      expect(response.headers["content-disposition"]).toBe("inline");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["cache-control"]).toBe(
        "public, max-age=60, must-revalidate",
      );
      expect(response.headers.etag).toBe(
        `"${currentRevision(post).fingerprint}-${HEADER_IMAGE_NAME}"`,
      );
      expect(response.body).toEqual(PNG_IMAGE);
    });

    it("returns an inline image by name", async () => {
      const post = await publishPost(
        postWithoutHeaderImage({
          inlineImages: [postImage(CHART, JPEG_IMAGE)],
        }),
      );

      const response = await getImage(post, CHART);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
      expect(response.body).toEqual(JPEG_IMAGE);
    });

    it("is not found for an image that is not on the post", async () => {
      const post = await publishPost();

      expectFailure(
        await getImage(post, "missing.png"),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("get", `/${MISSING_POST_ID}/images/${DIAGRAM}`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("reports an image whose file is missing from storage", async () => {
      const post = await publishPost();
      await deletePostStorage(post.fingerprint);

      expectFailure(
        await getImage(post, HEADER_IMAGE_NAME),
        500,
        ApiMessage.POST_FILES_UNAVAILABLE,
      );
    });
  });

  describe("GET /api/v1/posts/:id/images/:name/fullSize", () => {
    it("returns the header image at full size with its caching headers", async () => {
      const post = await publishPost();

      const response = await getImage(post, HEADER_IMAGE_NAME, "/fullSize");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("image/png");
      expect(response.headers["content-disposition"]).toBe("inline");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["cache-control"]).toBe(
        "public, max-age=60, must-revalidate",
      );
      expect(response.headers.etag).toBe(
        `"${currentRevision(post).fingerprint}-${HEADER_IMAGE_NAME}"`,
      );
      expect(response.body).toEqual(PNG_IMAGE);
    });

    it("returns an inline image at full size", async () => {
      const post = await publishPost(
        postWithoutHeaderImage({
          inlineImages: [postImage(CHART, JPEG_IMAGE)],
        }),
      );

      const response = await getImage(post, CHART, "/fullSize");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
      expect(response.body).toEqual(JPEG_IMAGE);
    });

    it("is not found for an image that is not on the post", async () => {
      const post = await publishPost();

      expectFailure(
        await getImage(post, "missing.png", "/fullSize"),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("get", `/${MISSING_POST_ID}/images/${DIAGRAM}/fullSize`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("reports an image whose file is missing from storage", async () => {
      const post = await publishPost();
      await deletePostStorage(post.fingerprint);

      expectFailure(
        await getImage(post, HEADER_IMAGE_NAME, "/fullSize"),
        500,
        ApiMessage.POST_FILES_UNAVAILABLE,
      );
    });
  });

  describe("the image routes after an edit", () => {
    it.each(
      IMAGE_ROUTES.flatMap(([route, size]) => [
        [
          "a header image",
          route,
          HEADER_IMAGE_NAME,
          size,
          { removeHeaderImage: true },
        ] as const,
        [
          "an inline image",
          route,
          DIAGRAM,
          size,
          { removeInlineImages: [DIAGRAM] },
        ] as const,
      ]),
    )(
      "no longer serve %s the edit removed through %s",
      async (_image, _route, name, size, edit) => {
        const post = await publishPost(postWithHeaderAndDiagram());
        expect((await getImage(post, name, size)).status).toBe(200);

        expect((await updatePost(post, edit)).status).toBe(200);

        expectFailure(
          await getImage(post, name, size),
          404,
          ApiMessage.POST_NOT_FOUND,
        );
      },
    );

    it.each(IMAGE_ROUTES)(
      "serve the new bytes of a replaced image under a new etag through %s",
      async (_route, size) => {
        const post = await publishPost(postWithHeaderAndDiagram());
        const before = await getImage(post, DIAGRAM, size);
        expect(before.status).toBe(200);

        const edited = await updatePost(post, {
          inlineImages: [postImage(DIAGRAM, LONGER_PNG_IMAGE)],
        });
        expect(edited.status).toBe(200);

        const after = await getImage(post, DIAGRAM, size);

        expect(after.status).toBe(200);
        expect(after.body).toEqual(LONGER_PNG_IMAGE);
        expect(after.headers.etag).toBe(
          `"${currentRevision(post).fingerprint}-${DIAGRAM}"`,
        );
        expect(after.headers.etag).not.toBe(before.headers.etag);
      },
    );
  });

  describe("an image request whose path the api will not accept", () => {
    it.each([
      ["a post id that is not an id", `/x/images/${DIAGRAM}`],
      [
        "a post id that is not an id at full size",
        `/x/images/${DIAGRAM}/fullSize`,
      ],
      [
        "an image name the api does not allow",
        `/${MISSING_POST_ID}/images/not-an-image`,
      ],
      [
        "an image name the api does not allow at full size",
        `/${MISSING_POST_ID}/images/not-an-image/fullSize`,
      ],
    ])("is rejected for %s", async (_description, path) => {
      expectFailure(
        await apiCall("get", path),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });
  });
});
