import { Types } from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_POST_INLINE_IMAGES,
  MAX_POST_TITLE_CHARACTERS,
  POST_CONTENT_NAME,
  POST_HEADER_IMAGE_NAME,
  postHeaderImagePath,
  PostSummary,
  UserNoPassword,
} from "@home/shared";
import { createApiToken } from "../auth/createApiToken";
import {
  ApiMessage,
  inlineImageNotAnImage,
  inlineImageNotOnPost,
  inlineImageTypeMismatch,
} from "../http/messages";
import { PostModel } from "../model/postModel";
import { deletePostStorage } from "../fileOperations/postStorage";
import { PostDocument } from "../types/db";
import {
  afterEachPostTest,
  apiCall,
  beforeEachPostTest,
  CONTENT,
  createPost,
  currentRevision,
  expectFailure,
  headerImageFile,
  headerImageResponse,
  inlineImage,
  inlineImageResponse,
  JPEG_IMAGE,
  loggedErrors,
  makeUser,
  NOT_AN_IMAGE,
  PNG_IMAGE,
  postResponse,
  postSummaryResponse,
  responsePost,
  savedPosts,
  storedFile,
  storedText,
  stubSave,
  stubUserLookup,
  validBody,
} from "../testFixtures/postFixtures";
import { storageControl } from "../testFixtures/storageControl";

vi.mock("../fileOperations/postStorage", async (importOriginal) => {
  const { failableStorage } = await import("../testFixtures/storageControl");

  return failableStorage(
    await importOriginal<typeof import("../fileOperations/postStorage")>(),
  );
});

const WEBP_IMAGE = Buffer.concat([
  Buffer.from("RIFF", "latin1"),
  Buffer.from([0x1a, 0x00, 0x00, 0x00]),
  Buffer.from("WEBPVP8L", "latin1"),
  Buffer.alloc(18),
]);

const avifImage = (brand: string) =>
  Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x20]),
    Buffer.from(`ftyp${brand}${brand}mif1miaf`, "latin1"),
    Buffer.alloc(12),
  ]);

const GIF_IMAGE = Buffer.concat([
  Buffer.from("GIF89a", "latin1"),
  Buffer.from([0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00]),
]);

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

const createdBody = (post: (typeof savedPosts)[number]) => ({
  error: false,
  message: ApiMessage.POST_CREATED,
  post: postResponse(post),
});

const expectRejected = (
  response: Awaited<ReturnType<typeof createPost>>,
  status: number,
  message: string,
) => {
  expectFailure(response, status, message);
  expect(savedPosts).toHaveLength(0);
};

const MISSING_POST_ID = new Types.ObjectId().toHexString();

const NEW_CONTENT = "# Take two\n\nThe post, rewritten.\n";

const stubPostLookup = (post: PostDocument | null) =>
  vi
    .spyOn(PostModel, "findById")
    .mockImplementation(
      () =>
        Promise.resolve(post) as unknown as ReturnType<
          typeof PostModel.findById
        >,
    );

const stubPostList = (posts: PostDocument[]) => {
  vi.spyOn(PostModel, "countDocuments").mockImplementation(
    () =>
      Promise.resolve(posts.length) as unknown as ReturnType<
        typeof PostModel.countDocuments
      >,
  );
  vi.spyOn(PostModel, "find").mockImplementation(
    () =>
      ({
        sort: () => ({
          skip: () => ({ limit: () => Promise.resolve(posts) }),
        }),
      }) as unknown as ReturnType<typeof PostModel.find>,
  );
};

const stubPostDelete = (post: PostDocument | null) =>
  vi
    .spyOn(PostModel, "findByIdAndDelete")
    .mockImplementation(
      () =>
        Promise.resolve(post) as unknown as ReturnType<
          typeof PostModel.findByIdAndDelete
        >,
    );

const publishPost = async (body: object = validBody()) => {
  await createPost(body);

  const post = savedPosts[savedPosts.length - 1];
  stubPostLookup(post);

  return post;
};

const postPath = (post: PostDocument) => `/${post._id.toString()}`;

const responseSummaries = (body: unknown) =>
  (body as { posts: PostSummary[] }).posts;

describe("the blog post api", () => {
  beforeEach(beforeEachPostTest);

  afterEach(afterEachPostTest);

  describe("POST /api/v1/posts", () => {
    describe("a published post", () => {
      it("stores the title, markdown content, and every image", async () => {
        const response = await createPost(
          validBody({
            inlineImages: [
              inlineImage("diagram.png", PNG_IMAGE),
              inlineImage("screenshot.jpg", JPEG_IMAGE),
            ],
          }),
        );

        const post = savedPosts[0];
        const postId = post._id.toString();
        const revision = currentRevision(post);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          ...createdBody(post),
          post: postResponse(post, {
            inlineImages: [
              inlineImageResponse(
                postId,
                "diagram.png",
                PNG_IMAGE,
                "image/png",
              ),
              inlineImageResponse(
                postId,
                "screenshot.jpg",
                JPEG_IMAGE,
                "image/jpeg",
              ),
            ],
          }),
        });

        expect(post.createdDate).toEqual(post.modifiedDate);
        expect(revision.content.name).toBe(`${POST_CONTENT_NAME}.md`);
        expect(revision.content.contentType).toBe(MARKDOWN_CONTENT_TYPE);

        await expect(storedText(revision.content.file)).resolves.toBe(CONTENT);
        await expect(storedFile(headerImageFile(revision))).resolves.toEqual(
          PNG_IMAGE,
        );
        await expect(
          storedFile(revision.inlineImages[0].file),
        ).resolves.toEqual(PNG_IMAGE);
        await expect(
          storedFile(revision.inlineImages[1].file),
        ).resolves.toEqual(JPEG_IMAGE);
      });

      it("stores a post that has only a title and content", async () => {
        const response = await createPost({ title: "a", content: "a" });

        const post = savedPosts[0];
        const revision = currentRevision(post);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          ...createdBody(post),
          post: postResponse(post, {
            title: "a",
            content: "a\n",
            headerImage: null,
          }),
        });
        expect(revision.headerImage).toBeUndefined();

        await expect(storedText(revision.content.file)).resolves.toBe("a\n");
      });

      it("accepts a header image sent as a data url", async () => {
        const response = await createPost(
          validBody({
            headerImage: `data:image/png;base64,${PNG_IMAGE.toString("base64")}`,
          }),
        );

        expect(response.status).toBe(200);
        expect(responsePost(response).headerImage).toEqual(
          headerImageResponse(savedPosts[0]._id.toString()),
        );
      });

      it.each([
        ["diagram.png", PNG_IMAGE, "image/png"],
        ["screenshot.jpg", JPEG_IMAGE, "image/jpeg"],
        ["chart.webp", WEBP_IMAGE, "image/webp"],
        ["photo.avif", avifImage("avif"), "image/avif"],
        ["sequence.avif", avifImage("avis"), "image/avif"],
        ["loop.gif", GIF_IMAGE, "image/gif"],
      ])("stores %s as an inline image", async (name, data, contentType) => {
        const response = await createPost(
          validBody({ inlineImages: [inlineImage(name, data)] }),
        );

        expect(response.status).toBe(200);
        expect(responsePost(response).inlineImages).toEqual([
          inlineImageResponse(
            savedPosts[0]._id.toString(),
            name,
            data,
            contentType,
          ),
        ]);
      });
    });

    describe("an author who may not publish", () => {
      it.each<[string, number, string, () => string | null]>([
        [
          "no authorization header",
          401,
          ApiMessage.UNAUTHENTICATED,
          () => null,
        ],
        [
          "a token this api did not sign",
          401,
          ApiMessage.UNAUTHENTICATED,
          () => "not.a.jwt",
        ],
        [
          "a token that is not an admin token",
          403,
          ApiMessage.FORBIDDEN,
          () => createApiToken(makeUser({ role: "user" })),
        ],
      ])("is refused for %s", async (_description, status, message, token) => {
        expectRejected(await createPost(validBody(), token()), status, message);
      });

      it.each<[string, number, string, UserNoPassword | null]>([
        ["no longer has an account", 401, ApiMessage.UNAUTHENTICATED, null],
        [
          "has been banned since signing in",
          403,
          ApiMessage.FORBIDDEN,
          makeUser({ userBanned: true }),
        ],
        [
          "is no longer an admin",
          403,
          ApiMessage.FORBIDDEN,
          makeUser({ role: "user" }),
        ],
      ])(
        "is refused when the author %s",
        async (_description, status, message, author) => {
          stubUserLookup(author);

          expectRejected(await createPost(validBody()), status, message);
        },
      );
    });

    describe("a request body the api will not accept", () => {
      it.each([
        ["a missing title", validBody({ title: undefined })],
        ["a blank title", validBody({ title: "   " })],
        [
          "an overlong title",
          validBody({ title: "a".repeat(MAX_POST_TITLE_CHARACTERS + 1) }),
        ],
        [
          "a title with bidirectional override characters",
          validBody({ title: "Building\u202Ethe blog" }),
        ],
        ["missing content", validBody({ content: undefined })],
        ["blank content", validBody({ content: " \n " })],
        [
          "content with control characters",
          validBody({ content: "Building\u0007the blog" }),
        ],
        [
          "a header image that is not base64",
          validBody({ headerImage: "n0t b@se64" }),
        ],
        ["an empty header image", validBody({ headerImage: "" })],
        [
          "an inline image name with an unsupported extension",
          validBody({ inlineImages: [inlineImage("diagram.bmp", PNG_IMAGE)] }),
        ],
        [
          "two inline images sharing a name",
          validBody({
            inlineImages: [
              inlineImage("diagram.png", PNG_IMAGE),
              inlineImage("Diagram.png", PNG_IMAGE),
            ],
          }),
        ],
        [
          "more inline images than a post may add at once",
          validBody({
            inlineImages: Array.from(
              { length: MAX_POST_INLINE_IMAGES + 1 },
              (_value, index) => inlineImage(`diagram-${index}.png`, PNG_IMAGE),
            ),
          }),
        ],
      ])("is rejected for %s", async (_description, body) => {
        expectRejected(await createPost(body), 400, ApiMessage.INVALID_REQUEST);
      });
    });

    describe("an image that is not an image", () => {
      it.each([
        [
          "a header image of an unsupported type",
          validBody({ headerImage: NOT_AN_IMAGE.toString("base64") }),
          ApiMessage.POST_IMAGE_INVALID,
        ],
        [
          "an inline image of an unsupported type",
          validBody({
            inlineImages: [inlineImage("diagram.png", NOT_AN_IMAGE)],
          }),
          inlineImageNotAnImage("diagram.png"),
        ],
        [
          "an inline image whose contents do not match its name",
          validBody({ inlineImages: [inlineImage("diagram.png", JPEG_IMAGE)] }),
          inlineImageTypeMismatch("diagram.png"),
        ],
      ])("is rejected for %s", async (_description, body, message) => {
        expectRejected(await createPost(body), 400, message);
      });
    });

    describe("a post that cannot be saved", () => {
      beforeEach(() => {
        stubSave(new Error("mongo is unreachable"));
      });

      it("removes the files it wrote and reports an unexpected failure", async () => {
        const response = await createPost(
          validBody({ inlineImages: [inlineImage("diagram.png", PNG_IMAGE)] }),
        );

        const revision = currentRevision(savedPosts[0]);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: true,
          message: ApiMessage.UNEXPECTED,
        });

        await expect(storedFile(revision.content.file)).rejects.toThrow();
        await expect(storedFile(headerImageFile(revision))).rejects.toThrow();
        await expect(
          storedFile(revision.inlineImages[0].file),
        ).rejects.toThrow();
      });

      it("logs and keeps reporting the save failure when cleanup also fails", async () => {
        storageControl.cleanupFails = true;

        const response = await createPost(validBody());

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: true,
          message: ApiMessage.UNEXPECTED,
        });
        expect(loggedErrors).toContainEqual([
          `Failed to clean up storage for post ${savedPosts[0].fingerprint}:`,
          expect.any(Error),
        ]);
      });
    });
  });

  describe("GET /api/v1/posts", () => {
    it("returns a page of post summaries", async () => {
      const post = await publishPost();
      stubPostList([post]);

      const response = await apiCall("get", "?page=1&pageSize=10");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        posts: [postSummaryResponse(post)],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPosts: 1,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("lists a post whose author no longer has an account", async () => {
      const post = await publishPost();
      stubUserLookup(null);
      stubPostList([post]);

      const response = await apiCall("get", "");

      expect(response.status).toBe(200);
      expect(responseSummaries(response.body)[0].authorUsername).toBeNull();
    });
  });

  describe("GET /api/v1/posts/:id", () => {
    it("returns the post with its content and images", async () => {
      const post = await publishPost(
        validBody({ inlineImages: [inlineImage("diagram.png", PNG_IMAGE)] }),
      );

      const response = await apiCall("get", postPath(post));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        post: postResponse(post, {
          inlineImages: [
            inlineImageResponse(
              post._id.toString(),
              "diagram.png",
              PNG_IMAGE,
              "image/png",
            ),
          ],
        }),
      });
    });

    it("returns a null author when the author no longer has an account", async () => {
      const post = await publishPost();
      stubUserLookup(null);

      const response = await apiCall("get", postPath(post));

      expect(response.status).toBe(200);
      expect(responsePost(response).authorUsername).toBeNull();
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("get", `/${MISSING_POST_ID}`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("reports a post whose files are missing from storage", async () => {
      const post = await publishPost();
      await deletePostStorage(post.fingerprint);

      expectFailure(
        await apiCall("get", postPath(post)),
        500,
        ApiMessage.POST_FILES_UNAVAILABLE,
      );
    });

    it("reports a post that has no saved revision", async () => {
      const post = await publishPost();
      post.revisions.splice(0);

      expectFailure(
        await apiCall("get", postPath(post)),
        500,
        ApiMessage.POST_HAS_NO_REVISION,
      );
    });
  });

  describe("GET /api/v1/posts/:id/images", () => {
    it("returns the header image with its caching headers", async () => {
      const post = await publishPost();

      const response = await apiCall("get", `${postPath(post)}/headerImage`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("image/png");
      expect(response.headers.etag).toBe(
        `"${currentRevision(post).fingerprint}"`,
      );
      expect(response.body).toEqual(PNG_IMAGE);
    });

    it("returns an inline image by name", async () => {
      const post = await publishPost(
        validBody({ inlineImages: [inlineImage("chart.jpg", JPEG_IMAGE)] }),
      );

      const response = await apiCall(
        "get",
        `${postPath(post)}/images/chart.jpg`,
      );

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
      expect(response.body).toEqual(JPEG_IMAGE);
    });

    it("is not found when the post has no header image", async () => {
      const post = await publishPost(validBody({ headerImage: undefined }));

      expectFailure(
        await apiCall("get", `${postPath(post)}/headerImage`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is not found for an image that is not on the post", async () => {
      const post = await publishPost();

      expectFailure(
        await apiCall("get", `${postPath(post)}/images/missing.png`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("get", `/${MISSING_POST_ID}/images/diagram.png`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });
  });

  describe("PATCH /api/v1/posts/:id", () => {
    it("publishes a new revision with the updated title and content", async () => {
      const post = await publishPost();
      const previous = currentRevision(post);

      const response = await apiCall("patch", postPath(post), {
        body: { title: "Take two", content: NEW_CONTENT },
      });

      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_UPDATED,
        post: postResponse(post, { title: "Take two", content: NEW_CONTENT }),
      });
      expect(post.revisions).toHaveLength(2);
      expect(revision.fingerprint).not.toBe(previous.fingerprint);

      await expect(storedText(revision.content.file)).resolves.toBe(
        NEW_CONTENT,
      );
    });

    it("carries images forward and replaces the ones it is asked to", async () => {
      const post = await publishPost(
        validBody({ inlineImages: [inlineImage("diagram.png", PNG_IMAGE)] }),
      );

      const response = await apiCall("patch", postPath(post), {
        body: {
          inlineImages: [inlineImage("chart.jpg", JPEG_IMAGE)],
          removeInlineImages: ["diagram.png"],
        },
      });

      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(responsePost(response).inlineImages).toEqual([
        inlineImageResponse(
          post._id.toString(),
          "chart.jpg",
          JPEG_IMAGE,
          "image/jpeg",
        ),
      ]);

      await expect(storedText(revision.content.file)).resolves.toBe(
        postResponse(post).content,
      );
      await expect(storedFile(headerImageFile(revision))).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(revision.inlineImages[0].file)).resolves.toEqual(
        JPEG_IMAGE,
      );
    });

    it("replaces the header image with a new one", async () => {
      const post = await publishPost();

      const response = await apiCall("patch", postPath(post), {
        body: { headerImage: JPEG_IMAGE.toString("base64") },
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toEqual({
        name: `${POST_HEADER_IMAGE_NAME}.jpg`,
        contentType: "image/jpeg",
        byteSize: JPEG_IMAGE.byteLength,
        path: postHeaderImagePath(post._id.toString()),
      });
    });

    it("removes the header image when it is sent as null", async () => {
      const post = await publishPost();

      const response = await apiCall("patch", postPath(post), {
        body: { headerImage: null },
      });

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toBeNull();
      expect(currentRevision(post).headerImage).toBeUndefined();
    });

    it.each([
      [
        "a header image that is not an image",
        { headerImage: NOT_AN_IMAGE.toString("base64") },
        ApiMessage.POST_IMAGE_INVALID,
      ],
      [
        "an inline image that is not an image",
        { inlineImages: [inlineImage("diagram.png", NOT_AN_IMAGE)] },
        inlineImageNotAnImage("diagram.png"),
      ],
      [
        "removing an image that is not on the post",
        { removeInlineImages: ["diagram.png"] },
        inlineImageNotOnPost("diagram.png"),
      ],
    ])("is rejected for %s", async (_description, body, message) => {
      const post = await publishPost();

      expectFailure(
        await apiCall("patch", postPath(post), { body }),
        400,
        message,
      );
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("patch", `/${MISSING_POST_ID}`, {
          body: { title: "Take two" },
        }),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is forbidden for a token that is not an admin token", async () => {
      const post = await publishPost();

      expectFailure(
        await apiCall("patch", postPath(post), {
          body: { title: "Take two" },
          token: createApiToken(makeUser({ role: "user" })),
        }),
        403,
        ApiMessage.FORBIDDEN,
      );
    });

    it("is refused when the author no longer has an account", async () => {
      const post = await publishPost();
      stubUserLookup(null);

      expectFailure(
        await apiCall("patch", postPath(post), {
          body: { title: "Take two" },
        }),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });
  });

  describe("DELETE /api/v1/posts/:id", () => {
    it("deletes the post and the files it stored", async () => {
      const post = await publishPost();
      const revision = currentRevision(post);
      stubPostDelete(post);

      const response = await apiCall("delete", postPath(post));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_DELETED,
      });

      await expect(storedFile(revision.content.file)).rejects.toThrow();
      await expect(storedFile(headerImageFile(revision))).rejects.toThrow();
    });

    it("reports the post deleted when its files cannot be removed", async () => {
      const post = await publishPost();
      stubPostDelete(post);
      storageControl.cleanupFails = true;

      const response = await apiCall("delete", postPath(post));

      expect(response.status).toBe(200);
      expect(loggedErrors).toContainEqual([
        `Failed to clean up storage for post ${post.fingerprint}:`,
        expect.any(Error),
      ]);
    });

    it("is not found when the post does not exist", async () => {
      stubPostDelete(null);

      expectFailure(
        await apiCall("delete", `/${MISSING_POST_ID}`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is unauthenticated without an authorization header", async () => {
      expectFailure(
        await apiCall("delete", `/${MISSING_POST_ID}`, { token: null }),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });
  });

  describe("a request the router will not route", () => {
    it.each<[string, "get" | "patch" | "delete", string, object?]>([
      ["a page that is not a page number", "get", "?page=0"],
      ["a post id that is not an id", "get", "/not-an-id"],
      [
        "a post id that is not an id on the image route",
        "get",
        "/x/headerImage",
      ],
      [
        "an image name the api does not allow",
        "get",
        `/${MISSING_POST_ID}/images/not-an-image`,
      ],
      [
        "a post id that is not an id on an update",
        "patch",
        "/not-an-id",
        { title: "Take two" },
      ],
      [
        "an update body the api will not accept",
        "patch",
        `/${MISSING_POST_ID}`,
        { title: "   " },
      ],
      ["a post id that is not an id on a delete", "delete", "/not-an-id"],
    ])("is rejected for %s", async (_description, method, path, body) => {
      expectFailure(
        await apiCall(method, path, { body }),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });
  });
});
