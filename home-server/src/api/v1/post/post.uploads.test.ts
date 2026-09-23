import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiMessage, imageNotAnImage } from "../http/messages";
import {
  afterEachPostTest,
  apiCall,
  beforeEachPostTest,
  currentRevision,
  expectFailure,
  HEADER_IMAGE_NAME,
  MISSING_UPLOAD_ID,
  NOT_AN_IMAGE,
  PNG_IMAGE,
  PNG_IMAGE_SIZE,
  postPath,
  postWithoutHeaderImage,
  publishPost,
  responsePost,
  savedPosts,
  stagedImages,
  startUpload,
  storedUploads,
  TITLE,
  uploadPostImage,
} from "../testFixtures/postTestFixtures";

vi.mock("./postThumbnails", async (importOriginal) => {
  const { trackedThumbnailQueue } =
    await import("../testFixtures/storageTestControl");

  return trackedThumbnailQueue(
    await importOriginal<typeof import("./postThumbnails")>(),
  );
});

const DIAGRAM = "diagram.png";

const publishFrom = (uploadId: string) =>
  apiCall("post", "", { body: { title: TITLE, content: "A post.", uploadId } });

const editFrom = (post: (typeof savedPosts)[number], uploadId: string) =>
  apiCall("patch", postPath(post), {
    body: {
      title: TITLE,
      content: "A post.",
      revision: currentRevision(post).fingerprint,
      uploadId,
    },
  });

const inlineNames = (response: Awaited<ReturnType<typeof apiCall>>) =>
  responsePost(response).inlineImages.map((image) => image.name);

const stagedUpload = async (names: string[]) => {
  const uploadId = await startUpload({ inlineImages: names });

  for (const name of names) {
    expect((await uploadPostImage(uploadId, name, PNG_IMAGE)).status).toBe(200);
  }

  return uploadId;
};

describe("blog post image uploads", () => {
  beforeEach(beforeEachPostTest);

  afterEach(afterEachPostTest);

  describe("POST /api/v1/posts/uploads", () => {
    it("starts an upload and answers with its id", async () => {
      const response = await apiCall("post", "/uploads", {
        body: { headerImage: HEADER_IMAGE_NAME, inlineImages: [DIAGRAM] },
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_UPLOAD_STARTED,
        uploadId: expect.stringMatching(/^[0-9a-f]{32}$/) as string,
      });

      await expect(storedUploads()).resolves.toEqual([
        (response.body as { uploadId: string }).uploadId,
      ]);
    });

    it("is rejected for an image name with an unsupported extension", async () => {
      expectFailure(
        await apiCall("post", "/uploads", {
          body: { inlineImages: ["diagram.bmp"] },
        }),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });
  });

  describe("PUT /api/v1/posts/uploads/:uploadId/images/:name", () => {
    it("stores an image and reports its type and size", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      const response = await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_IMAGE_UPLOADED,
        image: {
          name: DIAGRAM,
          contentType: "image/png",
          byteSize: PNG_IMAGE.byteLength,
          ...PNG_IMAGE_SIZE,
        },
      });

      await expect(stagedImages(uploadId)).resolves.toEqual([DIAGRAM]);
    });

    it("is rejected for a file that is not an image", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      expectFailure(
        await uploadPostImage(uploadId, DIAGRAM, NOT_AN_IMAGE),
        400,
        imageNotAnImage(DIAGRAM),
      );
    });
  });

  describe("DELETE /api/v1/posts/uploads/:uploadId", () => {
    it("discards the upload and the images staged in it", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);

      const response = await apiCall("delete", `/uploads/${uploadId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_UPLOAD_DISCARDED,
      });
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("is not found for an upload that does not exist", async () => {
      expectFailure(
        await apiCall("delete", `/uploads/${MISSING_UPLOAD_ID}`),
        404,
        ApiMessage.POST_UPLOAD_NOT_FOUND,
      );
    });
  });

  describe("a post published from an upload", () => {
    it("discards the upload once the post is saved", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);

      const response = await publishFrom(uploadId);

      expect(response.status).toBe(200);
      expect(inlineNames(response)).toEqual([DIAGRAM]);
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("refuses an upload that is still missing the header image", async () => {
      const uploadId = await startUpload({
        headerImage: HEADER_IMAGE_NAME,
        inlineImages: [DIAGRAM],
      });
      expect((await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE)).status).toBe(
        200,
      );

      expectFailure(
        await publishFrom(uploadId),
        400,
        ApiMessage.POST_UPLOAD_INCOMPLETE,
      );
      expect(savedPosts).toHaveLength(0);
      await expect(storedUploads()).resolves.toEqual([uploadId]);
    });
  });

  describe("a post edited from an upload", () => {
    it("adds the upload's images and discards the upload once the edit is saved", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      const uploadId = await stagedUpload([DIAGRAM]);

      const response = await editFrom(post, uploadId);

      expect(response.status).toBe(200);
      expect(inlineNames(response)).toEqual([DIAGRAM]);
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("refuses an upload that is not complete, keeping it", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      expectFailure(
        await editFrom(post, uploadId),
        400,
        ApiMessage.POST_UPLOAD_INCOMPLETE,
      );
      expect(post.revisions).toHaveLength(1);
      await expect(storedUploads()).resolves.toEqual([uploadId]);
    });
  });
});
