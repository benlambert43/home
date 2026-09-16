import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_POST_IMAGE_NAME_CHARACTERS,
  MAX_POST_INLINE_IMAGES,
  POST_IMAGE_FIELD,
} from "@home/shared";
import { createApiToken } from "../auth/createApiToken";
import {
  ApiMessage,
  imageAlreadyUploaded,
  imageNotAnImage,
  imageNotInUpload,
  imageTypeMismatch,
} from "../http/messages";
import {
  addDanglingUpload,
  afterEachPostTest,
  apiCall,
  beforeEachPostTest,
  breakUploadStorage,
  CONTENT,
  corruptUploadManifest,
  currentRevision,
  expectFailure,
  HEADER_IMAGE_NAME,
  JPEG_IMAGE,
  loggedErrors,
  LONGER_PNG_IMAGE,
  makeUploadIdle,
  makeUser,
  MISSING_UPLOAD_ID,
  NOT_AN_IMAGE,
  OTHER_PNG_IMAGE,
  PNG_IMAGE,
  postPath,
  postWithoutHeaderImage,
  publishPost,
  putPostImage,
  removeIncomingDirectory,
  removeStagedImageDirectory,
  responsePost,
  savedPosts,
  stagedImages,
  startUpload,
  storedFile,
  storedUploads,
  stubPostLookup,
  stubSave,
  stubUserLookup,
  TITLE,
  uploadPostImage,
  writeStagedImage,
} from "../testFixtures/postTestFixtures";
import { storageControl } from "../testFixtures/storageTestControl";

vi.mock("@home/shared", async (importOriginal) => {
  const { cappedImageBytes } =
    await import("../testFixtures/storageTestControl");

  return cappedImageBytes(
    await importOriginal<typeof import("@home/shared")>(),
  );
});

vi.mock("../fileOperations/uploadStorage", async (importOriginal) => {
  const { failableUploadStorage } =
    await import("../testFixtures/storageTestControl");

  return failableUploadStorage(
    await importOriginal<typeof import("../fileOperations/uploadStorage")>(),
  );
});

vi.mock("node:fs/promises", async (importOriginal) => {
  const { failableIncomingImageRemoval } =
    await import("../testFixtures/storageTestControl");

  return failableIncomingImageRemoval(
    await importOriginal<typeof import("node:fs/promises")>(),
  );
});

const DIAGRAM = "diagram.png";

const CHART = "chart.jpg";

const inlineImageNames = (count: number) =>
  Array.from({ length: count }, (_value, index) => `diagram-${index}.png`);

const publishFrom = (uploadId: string, title = TITLE) =>
  apiCall("post", "", { body: { title, content: "A post.", uploadId } });

const editFrom = (post: (typeof savedPosts)[number], uploadId: string) =>
  apiCall("patch", postPath(post), { body: { uploadId } });

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

    it("starts an upload that expects no images", async () => {
      const response = await apiCall("post", "/uploads", {
        body: { inlineImages: [] },
      });

      expect(response.status).toBe(200);
    });

    it("starts an upload whose image name is as long as the api allows", async () => {
      const response = await apiCall("post", "/uploads", {
        body: {
          inlineImages: [
            `${"a".repeat(MAX_POST_IMAGE_NAME_CHARACTERS - ".png".length)}.png`,
          ],
        },
      });

      expect(response.status).toBe(200);
    });

    it("starts an upload for the greatest number of images the api allows", async () => {
      const response = await apiCall("post", "/uploads", {
        body: { inlineImages: inlineImageNames(MAX_POST_INLINE_IMAGES) },
      });

      expect(response.status).toBe(200);
    });

    it.each([
      ["a missing list of inline images", {}],
      ["a list of inline images that is not a list", { inlineImages: DIAGRAM }],
      [
        "an image name with an unsupported extension",
        { inlineImages: ["diagram.bmp"] },
      ],
      [
        "an image name with an uppercase extension",
        { inlineImages: ["diagram.PNG"] },
      ],
      [
        "an image name that does not start with a letter or a number",
        { inlineImages: ["-diagram.png"] },
      ],
      [
        "an image name one character longer than the api allows",
        {
          inlineImages: [
            `${"a".repeat(MAX_POST_IMAGE_NAME_CHARACTERS - ".png".length + 1)}.png`,
          ],
        },
      ],
      [
        "two inline images whose names differ only in case",
        { inlineImages: [DIAGRAM, "Diagram.png"] },
      ],
      [
        "a header image sharing a name with an inline image",
        { headerImage: DIAGRAM, inlineImages: [DIAGRAM] },
      ],
      [
        "more inline images than a post may add at once",
        { inlineImages: inlineImageNames(MAX_POST_INLINE_IMAGES + 1) },
      ],
    ])("is rejected for %s", async (_description, body) => {
      expectFailure(
        await apiCall("post", "/uploads", { body }),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });

    it.each<[string, number, string, () => string | null]>([
      ["no authorization header", 401, ApiMessage.UNAUTHENTICATED, () => null],
      [
        "a token that is not an admin token",
        403,
        ApiMessage.FORBIDDEN,
        () => createApiToken(makeUser({ role: "user" })),
      ],
    ])("is refused for %s", async (_description, status, message, token) => {
      expectFailure(
        await apiCall("post", "/uploads", {
          body: { inlineImages: [] },
          token: token(),
        }),
        status,
        message,
      );
    });

    it("is refused when the author no longer has an account", async () => {
      stubUserLookup(null);

      expectFailure(
        await apiCall("post", "/uploads", { body: { inlineImages: [] } }),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });

    it("deletes uploads that have been idle for a day", async () => {
      const idle = await startUpload({ inlineImages: [] });
      const recent = await startUpload({ inlineImages: [] });
      await makeUploadIdle(idle);
      await addDanglingUpload("dangling");

      const started = await startUpload({ inlineImages: [] });

      await expect(storedUploads()).resolves.toEqual(
        expect.arrayContaining([recent, started, "dangling"]),
      );
      await expect(storedUploads()).resolves.not.toContain(idle);
    });

    it("keeps an idle upload that is used again before the next sweep", async () => {
      const reused = await startUpload({ inlineImages: [DIAGRAM] });
      await makeUploadIdle(reused);
      expect((await uploadPostImage(reused, DIAGRAM, PNG_IMAGE)).status).toBe(
        200,
      );

      await startUpload({ inlineImages: [] });

      await expect(storedUploads()).resolves.toContain(reused);
    });

    it("discards an upload it could not finish starting", async () => {
      storageControl.uploadCreateFails = true;

      const response = await apiCall("post", "/uploads", {
        body: { inlineImages: [] },
      });

      expect(response.status).toBe(500);
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("logs when the upload it could not start cannot be discarded", async () => {
      storageControl.uploadCreateFails = true;
      storageControl.uploadCleanupFails = true;

      const response = await apiCall("post", "/uploads", {
        body: { inlineImages: [] },
      });

      expect(response.status).toBe(500);
      expect(loggedErrors).toContainEqual([
        expect.stringMatching(/^Failed to clean up upload [0-9a-f]{32}:$/),
        expect.any(Error),
      ]);
    });

    it("reports upload storage it cannot read", async () => {
      await breakUploadStorage();

      const response = await apiCall("post", "/uploads", {
        body: { inlineImages: [] },
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: ApiMessage.UNEXPECTED,
      });
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
        },
      });

      await expect(stagedImages(uploadId)).resolves.toEqual([DIAGRAM]);
    });

    it("logs when the received image cannot be discarded", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });
      storageControl.incomingImageCleanupFails = true;

      const response = await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE);

      expect(response.status).toBe(200);
      expect(loggedErrors).toContainEqual([
        expect.stringMatching(/^Failed to clean up incoming image .+:$/),
        expect.any(Error),
      ]);
    });

    it("accepts the same image sent again", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);

      const response = await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE);

      expect(response.status).toBe(200);
      await expect(stagedImages(uploadId)).resolves.toEqual([DIAGRAM]);
    });

    it.each([
      ["of a different size", LONGER_PNG_IMAGE],
      ["of the same size", OTHER_PNG_IMAGE],
    ])(
      "refuses a different image %s under a name that is already uploaded",
      async (_description, data) => {
        const uploadId = await stagedUpload([DIAGRAM]);

        expectFailure(
          await uploadPostImage(uploadId, DIAGRAM, data),
          400,
          imageAlreadyUploaded(DIAGRAM),
        );
      },
    );

    it("keeps the image already staged when a different one is refused under its name", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM, CHART] });
      expect((await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE)).status).toBe(
        200,
      );

      expectFailure(
        await uploadPostImage(uploadId, DIAGRAM, OTHER_PNG_IMAGE),
        400,
        imageAlreadyUploaded(DIAGRAM),
      );

      expect((await uploadPostImage(uploadId, CHART, JPEG_IMAGE)).status).toBe(
        200,
      );

      const response = await publishFrom(uploadId);

      const revision = currentRevision(savedPosts[0]);

      expect(response.status).toBe(200);
      expect(inlineNames(response)).toEqual([DIAGRAM, CHART]);
      await expect(storedFile(revision.inlineImages[0].file)).resolves.toEqual(
        PNG_IMAGE,
      );
    });

    it.each([
      [
        "an image that is not in the upload",
        CHART,
        PNG_IMAGE,
        imageNotInUpload(CHART),
      ],
      [
        "a file that is not an image",
        DIAGRAM,
        NOT_AN_IMAGE,
        imageNotAnImage(DIAGRAM),
      ],
      [
        "an image whose contents do not match its name",
        DIAGRAM,
        JPEG_IMAGE,
        imageTypeMismatch(DIAGRAM),
      ],
    ])("is rejected for %s", async (_description, name, data, message) => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      expectFailure(await uploadPostImage(uploadId, name, data), 400, message);
    });

    it("is rejected when no image is sent", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      expectFailure(
        await putPostImage(uploadId, DIAGRAM),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });

    it("is rejected when more than one image is sent", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      expectFailure(
        await putPostImage(uploadId, DIAGRAM)
          .attach(POST_IMAGE_FIELD, PNG_IMAGE, "first")
          .attach(POST_IMAGE_FIELD, PNG_IMAGE, "second"),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });

    it("is rejected when the image is larger than the api allows", async () => {
      storageControl.maxImageBytes = PNG_IMAGE.byteLength - 1;
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      expectFailure(
        await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE),
        413,
        ApiMessage.REQUEST_TOO_LARGE,
      );
    });

    it("is not found for an upload that does not exist", async () => {
      expectFailure(
        await uploadPostImage(MISSING_UPLOAD_ID, DIAGRAM, PNG_IMAGE),
        404,
        ApiMessage.POST_UPLOAD_NOT_FOUND,
      );
    });

    it.each([
      ["incoming image", removeIncomingDirectory],
      ["staged image", removeStagedImageDirectory],
    ])(
      "is not found when the upload's %s directory is missing",
      async (_description, discard) => {
        const uploadId = await startUpload({ inlineImages: [DIAGRAM] });
        await discard(uploadId);

        expectFailure(
          await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE),
          404,
          ApiMessage.POST_UPLOAD_NOT_FOUND,
        );
      },
    );

    it("reports an upload whose manifest cannot be read", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });
      await corruptUploadManifest(uploadId);

      expectFailure(
        await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE),
        500,
        ApiMessage.UNEXPECTED,
      );
    });

    it("is rejected for an upload id that is not an upload id", async () => {
      expectFailure(
        await uploadPostImage("not-an-upload", DIAGRAM, PNG_IMAGE),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });

    it("is unauthenticated without an authorization header", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });

      expectFailure(
        await putPostImage(uploadId, DIAGRAM, null),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });

    it("is forbidden when the author is no longer an admin", async () => {
      const uploadId = await startUpload({ inlineImages: [DIAGRAM] });
      stubUserLookup(makeUser({ role: "user" }));

      expectFailure(
        await uploadPostImage(uploadId, DIAGRAM, PNG_IMAGE),
        403,
        ApiMessage.FORBIDDEN,
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

    it("is rejected for an upload id that is not an upload id", async () => {
      expectFailure(
        await apiCall("delete", "/uploads/not-an-upload"),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });

    it("is unauthenticated without an authorization header", async () => {
      expectFailure(
        await apiCall("delete", `/uploads/${MISSING_UPLOAD_ID}`, {
          token: null,
        }),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });

    it("is forbidden when the author is no longer an admin", async () => {
      stubUserLookup(makeUser({ role: "user" }));

      expectFailure(
        await apiCall("delete", `/uploads/${MISSING_UPLOAD_ID}`),
        403,
        ApiMessage.FORBIDDEN,
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

    it("publishes the greatest number of inline images an upload may hold", async () => {
      const names = inlineImageNames(MAX_POST_INLINE_IMAGES);
      const uploadId = await stagedUpload(names);

      const response = await publishFrom(uploadId);

      expect(response.status).toBe(200);
      expect(inlineNames(response)).toEqual(names);
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("publishes a post from an upload that has no images", async () => {
      const uploadId = await startUpload({ inlineImages: [] });

      const response = await publishFrom(uploadId);

      expect(response.status).toBe(200);
      expect(responsePost(response).headerImage).toBeNull();
      expect(responsePost(response).inlineImages).toEqual([]);
    });

    it("accepts an upload id written in upper case", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);

      const response = await publishFrom(uploadId.toUpperCase());

      expect(response.status).toBe(200);
      expect(inlineNames(response)).toEqual([DIAGRAM]);
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("ignores staged files that the upload did not ask for", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);
      await writeStagedImage(uploadId, "extra.png", PNG_IMAGE);

      const response = await publishFrom(uploadId);

      const revision = currentRevision(savedPosts[0]);

      expect(response.status).toBe(200);
      expect(inlineNames(response)).toEqual([DIAGRAM]);
      expect(revision.headerImage).toBeUndefined();
      expect(revision.inlineImages).toHaveLength(1);
    });

    it("keeps the upload when the post cannot be saved so it can be retried", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);
      stubSave(new Error("mongo is unreachable"));

      const response = await publishFrom(uploadId);

      expect(response.status).toBe(500);
      await expect(storedUploads()).resolves.toEqual([uploadId]);

      stubSave();

      const retried = await publishFrom(uploadId);

      expect(retried.status).toBe(200);
      expect(inlineNames(retried)).toEqual([DIAGRAM]);
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("keeps the upload when the post it would publish is refused", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);

      expectFailure(
        await publishFrom(uploadId, "   "),
        400,
        ApiMessage.INVALID_REQUEST,
      );
      expect(savedPosts).toHaveLength(0);
      await expect(storedUploads()).resolves.toEqual([uploadId]);
    });

    it("logs when the upload cannot be discarded after the post is saved", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);
      storageControl.uploadCleanupFails = true;

      const response = await publishFrom(uploadId);

      expect(response.status).toBe(200);
      expect(loggedErrors).toContainEqual([
        `Failed to clean up upload ${uploadId}:`,
        expect.any(Error),
      ]);
    });

    it.each([
      ["the header image", DIAGRAM],
      ["an inline image", HEADER_IMAGE_NAME],
    ])(
      "refuses an upload that is still missing %s",
      async (_description, uploaded) => {
        const uploadId = await startUpload({
          headerImage: HEADER_IMAGE_NAME,
          inlineImages: [DIAGRAM],
        });
        expect(
          (await uploadPostImage(uploadId, uploaded, PNG_IMAGE)).status,
        ).toBe(200);

        expectFailure(
          await publishFrom(uploadId),
          400,
          ApiMessage.POST_UPLOAD_INCOMPLETE,
        );
        expect(savedPosts).toHaveLength(0);
        await expect(storedUploads()).resolves.toEqual([uploadId]);
      },
    );

    it("refuses an upload that cannot be found", async () => {
      expectFailure(
        await publishFrom(MISSING_UPLOAD_ID),
        400,
        ApiMessage.POST_UPLOAD_NOT_FOUND,
      );
      expect(savedPosts).toHaveLength(0);
    });

    it("refuses an upload that has already published a post", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);
      await publishFrom(uploadId);

      expectFailure(
        await publishFrom(uploadId),
        400,
        ApiMessage.POST_UPLOAD_NOT_FOUND,
      );
      expect(savedPosts).toHaveLength(1);
    });

    it("refuses a staged image that is no longer an image", async () => {
      const uploadId = await stagedUpload([DIAGRAM]);
      await writeStagedImage(uploadId, DIAGRAM, NOT_AN_IMAGE);

      expectFailure(await publishFrom(uploadId), 400, imageNotAnImage(DIAGRAM));
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

    it("keeps every image when the upload has no images", async () => {
      const post = await publishPost();
      const uploadId = await startUpload({ inlineImages: [] });

      const response = await editFrom(post, uploadId);

      expect(response.status).toBe(200);
      expect(responsePost(response)).toMatchObject({
        title: TITLE,
        content: CONTENT,
        headerImage: { name: HEADER_IMAGE_NAME },
        inlineImages: [],
      });
      expect(post.revisions).toHaveLength(2);
      await expect(storedUploads()).resolves.toEqual([]);
    });

    it("keeps the upload when the edit cannot be saved", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      const uploadId = await stagedUpload([DIAGRAM]);
      stubSave(new Error("mongo is unreachable"));

      const response = await editFrom(post, uploadId);

      expect(response.status).toBe(500);
      await expect(storedUploads()).resolves.toEqual([uploadId]);
    });

    it("keeps the upload when the post does not exist", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      const uploadId = await stagedUpload([DIAGRAM]);
      stubPostLookup(null);

      expectFailure(
        await editFrom(post, uploadId),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
      await expect(storedUploads()).resolves.toEqual([uploadId]);
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

    it("refuses a staged image that is no longer an image, keeping the upload", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      const uploadId = await stagedUpload([DIAGRAM]);
      await writeStagedImage(uploadId, DIAGRAM, NOT_AN_IMAGE);

      expectFailure(
        await editFrom(post, uploadId),
        400,
        imageNotAnImage(DIAGRAM),
      );
      expect(post.revisions).toHaveLength(1);
      await expect(storedUploads()).resolves.toEqual([uploadId]);
    });

    it("refuses an upload that cannot be found", async () => {
      const post = await publishPost(postWithoutHeaderImage());

      expectFailure(
        await editFrom(post, MISSING_UPLOAD_ID),
        400,
        ApiMessage.POST_UPLOAD_NOT_FOUND,
      );
      expect(post.revisions).toHaveLength(1);
    });

    it("refuses an upload that an earlier edit already used", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      const uploadId = await stagedUpload([DIAGRAM]);
      await editFrom(post, uploadId);

      expectFailure(
        await editFrom(post, uploadId),
        400,
        ApiMessage.POST_UPLOAD_NOT_FOUND,
      );
      expect(post.revisions).toHaveLength(2);
    });
  });
});
