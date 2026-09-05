import { readFile } from "node:fs/promises";
import express from "express";
import { Types } from "mongoose";
import request, { Response } from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ApiFailure,
  CreatePostResponse,
  MAX_POST_INLINE_IMAGES,
  MAX_POST_TITLE_CHARACTERS,
  POST_CONTENT_NAME,
  POST_HEADER_IMAGE_NAME,
  postHeaderImagePath,
  postInlineImagePath,
  postInlineImageReference,
  SuccessOf,
  UserNoPassword,
} from "@home/shared";
import { createApiToken } from "../auth/createApiToken";
import {
  ApiMessage,
  inlineImageNotAnImage,
  inlineImageTypeMismatch,
} from "../http/messages";
import { PostModel } from "../model/postModel";
import { UserModel } from "../model/userModel";
import { deletePostStorage } from "../storage/postStorage";
import { resolveStoragePath } from "../storage/storagePath";
import { PostDocument } from "../types/db";
import postRouter from "./post";

const PNG_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

const JPEG_IMAGE = Buffer.from(
  "ffd8ffe000104a46494600010100000100010000fffe0004686900ffd9",
  "hex",
);

const WEBP_IMAGE = Buffer.concat([
  Buffer.from("RIFF", "latin1"),
  Buffer.from([0x1a, 0x00, 0x00, 0x00]),
  Buffer.from("WEBPVP8L", "latin1"),
  Buffer.alloc(18),
]);

const AVIF_IMAGE = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x20]),
  Buffer.from("ftypavifavifmif1miaf", "latin1"),
  Buffer.alloc(12),
]);

const AVIF_SEQUENCE_IMAGE = Buffer.concat([
  Buffer.from([0x00, 0x00, 0x00, 0x20]),
  Buffer.from("ftypavisavismif1miaf", "latin1"),
  Buffer.alloc(12),
]);

const GIF_IMAGE = Buffer.concat([
  Buffer.from("GIF89a", "latin1"),
  Buffer.from([0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00]),
]);

const NOT_AN_IMAGE = Buffer.from("# Markdown, not an image.", "utf8");

const TITLE = "Building the blog";

const CONTENT = "# Building the blog\n\nA first post about the API.\n";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

const storageControl = vi.hoisted(() => ({ cleanupFails: false }));

vi.mock("../storage/postStorage", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../storage/postStorage")>();

  return {
    ...actual,
    deletePostStorage: (post: string) =>
      storageControl.cleanupFails
        ? Promise.reject(new Error("storage is unreachable"))
        : actual.deletePostStorage(post),
  };
});

const savedPosts: PostDocument[] = [];

const loggedErrors: unknown[][] = [];

const app = express().use("/api/v1/posts", postRouter);

const makeUser = (overrides: Partial<UserNoPassword> = {}): UserNoPassword => ({
  _id: new Types.ObjectId().toHexString(),
  firstname: "Ben",
  lastname: "Lambert",
  email: "ben@example.com",
  username: "ben",
  confirmedEmail: true,
  userBanned: false,
  createdDate: "2026-01-01T00:00:00.000Z",
  modifiedDate: "2026-01-01T00:00:00.000Z",
  role: "admin",
  ...overrides,
});

const admin = makeUser();

const stubUserLookup = (user: UserNoPassword | null) => {
  vi.spyOn(UserModel, "findById").mockImplementation(
    () =>
      Promise.resolve(user) as unknown as ReturnType<typeof UserModel.findById>,
  );
};

const postDocumentPrototype = PostModel.prototype as {
  save: () => Promise<PostDocument>;
};

const stubSave = (failure?: Error) =>
  vi.spyOn(postDocumentPrototype, "save").mockImplementation(function (
    this: PostDocument,
  ) {
    savedPosts.push(this);
    return failure ? Promise.reject(failure) : Promise.resolve(this);
  });

const createPost = (body: object, token?: string) => {
  const call = request(app).post("/api/v1/posts");

  return token === undefined
    ? call.send(body)
    : call.set("Authorization", token).send(body);
};

const createdPost = (response: Response) =>
  (response.body as SuccessOf<CreatePostResponse>).post;

const failureMessage = (response: Response) =>
  (response.body as ApiFailure).message;

const validBody = (overrides: Record<string, unknown> = {}) => ({
  title: TITLE,
  content: CONTENT,
  headerImage: PNG_IMAGE.toString("base64"),
  ...overrides,
});

const inlineImage = (name: string, data: Buffer) => ({
  name,
  data: data.toString("base64"),
});

describe("POST /api/v1/posts", () => {
  beforeEach(() => {
    vi.stubEnv("API_SESSION_SECRET", "test-api-session-secret");
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      loggedErrors.push(args);
    });
    stubUserLookup(admin);
    stubSave();
  });

  afterEach(async () => {
    storageControl.cleanupFails = false;
    loggedErrors.splice(0);

    for (const post of savedPosts.splice(0)) {
      await deletePostStorage(post.fingerprint);
    }

    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("a published post", () => {
    it("stores a title, markdown content, and a header image", async () => {
      const response = await createPost(validBody(), createApiToken(admin));

      const post = savedPosts[0];
      const revision = post.revisions[0];

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_CREATED,
        post: {
          _id: post._id.toString(),
          title: TITLE,
          authorUserId: admin._id,
          authorUsername: admin.username,
          createdDate: post.createdDate.toISOString(),
          modifiedDate: post.modifiedDate.toISOString(),
          revision: revision.fingerprint,
          content: CONTENT,
          headerImage: {
            name: `${POST_HEADER_IMAGE_NAME}.png`,
            contentType: "image/png",
            byteSize: PNG_IMAGE.byteLength,
            path: postHeaderImagePath(post._id.toString()),
          },
          inlineImages: [],
        },
      });

      expect(post.createdDate).toEqual(post.modifiedDate);
      expect(revision.content.name).toBe(`${POST_CONTENT_NAME}.md`);
      expect(revision.content.contentType).toBe(MARKDOWN_CONTENT_TYPE);
      expect(revision.inlineImages).toEqual([]);

      await expect(
        readFile(resolveStoragePath(revision.content.file), "utf8"),
      ).resolves.toBe(CONTENT);
      await expect(
        readFile(resolveStoragePath(revision.headerImage.file)),
      ).resolves.toEqual(PNG_IMAGE);
    });

    it("stores inline images alongside the header image", async () => {
      const response = await createPost(
        validBody({
          headerImage: `data:image/png;base64,${PNG_IMAGE.toString("base64")}`,
          inlineImages: [
            inlineImage("diagram.png", PNG_IMAGE),
            inlineImage("screenshot.jpg", JPEG_IMAGE),
          ],
        }),
        createApiToken(admin),
      );

      const post = savedPosts[0];
      const postId = post._id.toString();
      const revision = post.revisions[0];

      expect(response.status).toBe(200);
      expect(createdPost(response).headerImage).toEqual({
        name: `${POST_HEADER_IMAGE_NAME}.png`,
        contentType: "image/png",
        byteSize: PNG_IMAGE.byteLength,
        path: postHeaderImagePath(postId),
      });
      expect(createdPost(response).inlineImages).toEqual([
        {
          name: "diagram.png",
          contentType: "image/png",
          byteSize: PNG_IMAGE.byteLength,
          path: postInlineImagePath(postId, "diagram.png"),
          reference: postInlineImageReference("diagram.png"),
        },
        {
          name: "screenshot.jpg",
          contentType: "image/jpeg",
          byteSize: JPEG_IMAGE.byteLength,
          path: postInlineImagePath(postId, "screenshot.jpg"),
          reference: postInlineImageReference("screenshot.jpg"),
        },
      ]);

      await expect(
        readFile(resolveStoragePath(revision.inlineImages[0].file)),
      ).resolves.toEqual(PNG_IMAGE);
      await expect(
        readFile(resolveStoragePath(revision.inlineImages[1].file)),
      ).resolves.toEqual(JPEG_IMAGE);
    });

    it.each([
      ["diagram.png", PNG_IMAGE, "image/png"],
      ["screenshot.jpg", JPEG_IMAGE, "image/jpeg"],
      ["chart.webp", WEBP_IMAGE, "image/webp"],
      ["photo.avif", AVIF_IMAGE, "image/avif"],
      ["sequence.avif", AVIF_SEQUENCE_IMAGE, "image/avif"],
      ["loop.gif", GIF_IMAGE, "image/gif"],
    ])("stores %s as an inline image", async (name, data, contentType) => {
      const response = await createPost(
        validBody({ inlineImages: [inlineImage(name, data)] }),
        createApiToken(admin),
      );

      expect(response.status).toBe(200);
      expect(createdPost(response).inlineImages).toEqual([
        {
          name,
          contentType,
          byteSize: data.byteLength,
          path: postInlineImagePath(savedPosts[0]._id.toString(), name),
          reference: postInlineImageReference(name),
        },
      ]);
    });
  });

  describe("an unauthorized request", () => {
    it("is unauthenticated without an authorization header", async () => {
      const response = await createPost(validBody());

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: true,
        message: ApiMessage.UNAUTHENTICATED,
      });
      expect(savedPosts).toHaveLength(0);
    });

    it("is unauthenticated with a token this api did not sign", async () => {
      const response = await createPost(validBody(), "not.a.jwt");

      expect(response.status).toBe(401);
      expect(failureMessage(response)).toBe(ApiMessage.UNAUTHENTICATED);
      expect(savedPosts).toHaveLength(0);
    });

    it("is forbidden for a token that is not an admin token", async () => {
      const response = await createPost(
        validBody(),
        createApiToken(makeUser({ role: "user" })),
      );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: true,
        message: ApiMessage.FORBIDDEN,
      });
      expect(savedPosts).toHaveLength(0);
    });

    it("is unauthenticated when the author no longer has an account", async () => {
      stubUserLookup(null);

      const response = await createPost(validBody(), createApiToken(admin));

      expect(response.status).toBe(401);
      expect(failureMessage(response)).toBe(ApiMessage.UNAUTHENTICATED);
      expect(savedPosts).toHaveLength(0);
    });

    it("is forbidden when the author has been banned since signing in", async () => {
      stubUserLookup(makeUser({ userBanned: true }));

      const response = await createPost(validBody(), createApiToken(admin));

      expect(response.status).toBe(403);
      expect(failureMessage(response)).toBe(ApiMessage.FORBIDDEN);
      expect(savedPosts).toHaveLength(0);
    });

    it("is forbidden when the author is no longer an admin", async () => {
      stubUserLookup(makeUser({ role: "user" }));

      const response = await createPost(validBody(), createApiToken(admin));

      expect(response.status).toBe(403);
      expect(failureMessage(response)).toBe(ApiMessage.FORBIDDEN);
      expect(savedPosts).toHaveLength(0);
    });
  });

  describe("an invalid request body", () => {
    it.each([
      [
        "a title and markdown content with no header image",
        { title: TITLE, content: CONTENT },
      ],
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
      const response = await createPost(body, createApiToken(admin));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: ApiMessage.INVALID_REQUEST,
      });
      expect(savedPosts).toHaveLength(0);
    });
  });

  describe("an image that is not an image", () => {
    it("rejects a header image that is not a supported image type", async () => {
      const response = await createPost(
        validBody({ headerImage: NOT_AN_IMAGE.toString("base64") }),
        createApiToken(admin),
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: ApiMessage.POST_IMAGE_INVALID,
      });
      expect(savedPosts).toHaveLength(0);
    });

    it("rejects an inline image that is not a supported image type", async () => {
      const response = await createPost(
        validBody({ inlineImages: [inlineImage("diagram.png", NOT_AN_IMAGE)] }),
        createApiToken(admin),
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: inlineImageNotAnImage("diagram.png"),
      });
      expect(savedPosts).toHaveLength(0);
    });

    it("rejects an inline image whose contents do not match its name", async () => {
      const response = await createPost(
        validBody({ inlineImages: [inlineImage("diagram.png", JPEG_IMAGE)] }),
        createApiToken(admin),
      );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: true,
        message: inlineImageTypeMismatch("diagram.png"),
      });
      expect(savedPosts).toHaveLength(0);
    });
  });

  describe("a post that cannot be saved", () => {
    it("removes the files it wrote and reports an unexpected failure", async () => {
      stubSave(new Error("mongo is unreachable"));

      const response = await createPost(
        validBody({ inlineImages: [inlineImage("diagram.png", PNG_IMAGE)] }),
        createApiToken(admin),
      );

      const revision = savedPosts[0].revisions[0];

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: ApiMessage.UNEXPECTED,
      });

      await expect(
        readFile(resolveStoragePath(revision.content.file)),
      ).rejects.toThrow();
      await expect(
        readFile(resolveStoragePath(revision.headerImage.file)),
      ).rejects.toThrow();
      await expect(
        readFile(resolveStoragePath(revision.inlineImages[0].file)),
      ).rejects.toThrow();
    });

    it("logs and keeps reporting the save failure when cleanup also fails", async () => {
      stubSave(new Error("mongo is unreachable"));
      storageControl.cleanupFails = true;

      const response = await createPost(validBody(), createApiToken(admin));

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
