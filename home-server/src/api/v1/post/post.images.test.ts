import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostImage } from "@home/shared";
import { ApiMessage, imageNameTaken } from "../http/messages";
import {
  afterEachPostTest,
  apiCall,
  beforeEachPostTest,
  createPost,
  currentRevision,
  expectFailure,
  HEADER_IMAGE_NAME,
  headerImageFile,
  headerImageResponse,
  imagePath,
  imageResponse,
  JPEG_IMAGE,
  PNG_IMAGE,
  postImage,
  postResponse,
  postWithHeaderImage,
  postWithoutHeaderImage,
  publishPost,
  responsePost,
  savedPosts,
  storedFile,
  storedUploads,
  updatePost,
} from "../testFixtures/postTestFixtures";

vi.mock("./postThumbnails", async (importOriginal) => {
  const { trackedThumbnailQueue } =
    await import("../testFixtures/storageTestControl");

  return trackedThumbnailQueue(
    await importOriginal<typeof import("./postThumbnails")>(),
  );
});

type SavedPost = (typeof savedPosts)[number];

const DIAGRAM = "diagram.png";

const CHART = "chart.jpg";

const postWithHeaderAndDiagram = () =>
  postWithHeaderImage({ inlineImages: [postImage(DIAGRAM, PNG_IMAGE)] });

const postWithHeaderDiagramAndChart = () =>
  postWithHeaderImage({
    inlineImages: [postImage(DIAGRAM, PNG_IMAGE), postImage(CHART, JPEG_IMAGE)],
  });

const imageNames = (images: PostImage[]) => images.map((image) => image.name);

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

    it("refuses a header image named like an inline image", async () => {
      const post = await publishPost(postWithHeaderAndDiagram());

      expectFailure(
        await updatePost(post, { headerImage: postImage(DIAGRAM, PNG_IMAGE) }),
        400,
        imageNameTaken(DIAGRAM),
      );
      expect(post.revisions).toHaveLength(1);
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

    it("refuses an inline image named like the header image, keeping the upload", async () => {
      const post = await publishPost();

      expectFailure(
        await updatePost(post, {
          inlineImages: [postImage(HEADER_IMAGE_NAME, PNG_IMAGE)],
        }),
        400,
        imageNameTaken(HEADER_IMAGE_NAME),
      );
      expect(post.revisions).toHaveLength(1);
      await expect(storedUploads()).resolves.toHaveLength(1);
    });
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
      expect(response.headers.etag).toMatch(/^"[0-9a-f]{32}"$/);
      expect(response.body).toEqual(PNG_IMAGE);
    });

    it("is not found for an image that is not on the post", async () => {
      const post = await publishPost();

      expectFailure(
        await getImage(post, "missing.png"),
        404,
        ApiMessage.POST_NOT_FOUND,
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
      expect(response.headers.etag).toMatch(/^"[0-9a-f]{32}"$/);
      expect(response.body).toEqual(PNG_IMAGE);
    });

    it("is not found for an image that is not on the post", async () => {
      const post = await publishPost();

      expectFailure(
        await getImage(post, "missing.png", "/fullSize"),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });
  });
});
