import { readFile } from "node:fs/promises";
import express from "express";
import { Types } from "mongoose";
import request, { Response } from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CreatePostResponse,
  MAX_POST_INLINE_IMAGES,
  MAX_POST_TITLE_CHARACTERS,
  Post,
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

const createPost = (
  body: object,
  token: string | null = createApiToken(admin),
) => {
  const call = request(app).post("/api/v1/posts");

  return token === null
    ? call.send(body)
    : call.set("Authorization", token).send(body);
};

const createdPost = (response: Response) =>
  (response.body as SuccessOf<CreatePostResponse>).post;

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

const headerImageFile = (post: PostDocument) => {
  const file = post.revisions[0].headerImage?.file;
  if (!file) throw new Error(`Post ${post.fingerprint} has no header image.`);

  return file;
};

const storedFile = (file: string) => readFile(resolveStoragePath(file));

const headerImageResponse = (postId: string) => ({
  name: `${POST_HEADER_IMAGE_NAME}.png`,
  contentType: "image/png",
  byteSize: PNG_IMAGE.byteLength,
  path: postHeaderImagePath(postId),
});

const inlineImageResponse = (
  postId: string,
  name: string,
  data: Buffer,
  contentType: string,
) => ({
  name,
  contentType,
  byteSize: data.byteLength,
  path: postInlineImagePath(postId, name),
  reference: postInlineImageReference(name),
});

const createdBody = (post: PostDocument, overrides: Partial<Post> = {}) => ({
  error: false,
  message: ApiMessage.POST_CREATED,
  post: {
    _id: post._id.toString(),
    title: TITLE,
    authorUserId: admin._id,
    authorUsername: admin.username,
    createdDate: post.createdDate.toISOString(),
    modifiedDate: post.modifiedDate.toISOString(),
    revision: post.revisions[0].fingerprint,
    content: CONTENT,
    headerImage: headerImageResponse(post._id.toString()),
    inlineImages: [],
    ...overrides,
  },
});

const expectRejected = (
  response: Response,
  status: number,
  message: string,
) => {
  expect(response.status).toBe(status);
  expect(response.body).toEqual({ error: true, message });
  expect(savedPosts).toHaveLength(0);
};

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
      const revision = post.revisions[0];

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        createdBody(post, {
          inlineImages: [
            inlineImageResponse(postId, "diagram.png", PNG_IMAGE, "image/png"),
            inlineImageResponse(
              postId,
              "screenshot.jpg",
              JPEG_IMAGE,
              "image/jpeg",
            ),
          ],
        }),
      );

      expect(post.createdDate).toEqual(post.modifiedDate);
      expect(revision.content.name).toBe(`${POST_CONTENT_NAME}.md`);
      expect(revision.content.contentType).toBe(MARKDOWN_CONTENT_TYPE);

      await expect(
        readFile(resolveStoragePath(revision.content.file), "utf8"),
      ).resolves.toBe(CONTENT);
      await expect(storedFile(headerImageFile(post))).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(revision.inlineImages[0].file)).resolves.toEqual(
        PNG_IMAGE,
      );
      await expect(storedFile(revision.inlineImages[1].file)).resolves.toEqual(
        JPEG_IMAGE,
      );
    });

    it("stores a post that has only a title and content", async () => {
      const response = await createPost({ title: "a", content: "a" });

      const post = savedPosts[0];
      const revision = post.revisions[0];

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        createdBody(post, { title: "a", content: "a\n", headerImage: null }),
      );
      expect(revision.headerImage).toBeUndefined();

      await expect(
        readFile(resolveStoragePath(revision.content.file), "utf8"),
      ).resolves.toBe("a\n");
    });

    it("accepts a header image sent as a data url", async () => {
      const response = await createPost(
        validBody({
          headerImage: `data:image/png;base64,${PNG_IMAGE.toString("base64")}`,
        }),
      );

      expect(response.status).toBe(200);
      expect(createdPost(response).headerImage).toEqual(
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
      expect(createdPost(response).inlineImages).toEqual([
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
      ["no authorization header", 401, ApiMessage.UNAUTHENTICATED, () => null],
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
        validBody({ inlineImages: [inlineImage("diagram.png", NOT_AN_IMAGE)] }),
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

      const post = savedPosts[0];
      const revision = post.revisions[0];

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: true,
        message: ApiMessage.UNEXPECTED,
      });

      await expect(storedFile(revision.content.file)).rejects.toThrow();
      await expect(storedFile(headerImageFile(post))).rejects.toThrow();
      await expect(storedFile(revision.inlineImages[0].file)).rejects.toThrow();
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
