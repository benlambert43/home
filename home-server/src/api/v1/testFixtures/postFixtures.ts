import { readdir, readFile, rm, stat } from "node:fs/promises";
import express from "express";
import { Types } from "mongoose";
import request, { Response } from "supertest";
import { expect, vi } from "vitest";
import {
  Post,
  POST_IMAGE_FIELD,
  postImagePath,
  postImageReference,
  PostSummary,
  UserNoPassword,
} from "@home/shared";
import { createApiToken } from "../auth/createApiToken";
import { PostModel } from "../model/postModel";
import { UserModel } from "../model/userModel";
import postRouter from "../post/post";
import { deletePostStorage } from "../fileOperations/postStorage";
import { resolveStoragePath } from "../fileOperations/storagePath";
import { PostDocument, StoredPostRevision } from "../types/db";
import { storageControl } from "./storageControl";

export const PNG_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export const JPEG_IMAGE = Buffer.from(
  "ffd8ffe000104a46494600010100000100010000fffe0004686900ffd9",
  "hex",
);

export const NOT_AN_IMAGE = Buffer.from("# Markdown, not an image.", "utf8");

export const HEADER_IMAGE_NAME = "cover.png";

export const TITLE = "Building the blog";

export const CONTENT = "# Building the blog\n\nA first post about the API.\n";

export const savedPosts: PostDocument[] = [];

export const loggedErrors: unknown[][] = [];

const app = express().use("/api/v1/posts", postRouter);

export const makeUser = (
  overrides: Partial<UserNoPassword> = {},
): UserNoPassword => ({
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

export const admin = makeUser();

const asQuery = <Result>(result: Result) => ({
  select: () => Promise.resolve(result),
  then: (resolve: (value: Result) => unknown) =>
    Promise.resolve(result).then(resolve),
});

export const stubUserLookup = (user: UserNoPassword | null) => {
  vi.spyOn(UserModel, "findById").mockImplementation(
    () => asQuery(user) as unknown as ReturnType<typeof UserModel.findById>,
  );
  vi.spyOn(UserModel, "find").mockImplementation(
    () =>
      asQuery(user ? [user] : []) as unknown as ReturnType<
        typeof UserModel.find
      >,
  );
};

const postDocumentPrototype = PostModel.prototype as {
  save: () => Promise<PostDocument>;
};

export const stubSave = (failure?: Error) =>
  vi.spyOn(postDocumentPrototype, "save").mockImplementation(function (
    this: PostDocument,
  ) {
    savedPosts.push(this);
    return failure ? Promise.reject(failure) : Promise.resolve(this);
  });

export const apiCall = (
  method: "get" | "post" | "patch" | "delete",
  path: string,
  {
    body,
    token = createApiToken(admin),
  }: { body?: object; token?: string | null } = {},
) => {
  const call = request(app)[method](`/api/v1/posts${path}`);
  const authorized = token === null ? call : call.set("Authorization", token);

  return body === undefined ? authorized : authorized.send(body);
};

interface NamedImage {
  name: string;
  data: Buffer;
}

interface PostRequest {
  headerImage?: NamedImage;
  inlineImages?: NamedImage[];
  [field: string]: unknown;
}

const uploadImage = (path: string, data: Buffer) =>
  request(app)
    .put(`/api/v1/posts/uploads/${path}`)
    .set("Authorization", createApiToken(admin))
    .attach(POST_IMAGE_FIELD, data, "image");

const sendWithImages = async (
  method: "post" | "patch",
  path: string,
  { headerImage, inlineImages = [], ...body }: PostRequest,
  token?: string | null,
): Promise<Response> => {
  if (headerImage === undefined && inlineImages.length === 0) {
    return apiCall(method, path, { body, token });
  }

  const upload = await apiCall("post", "/uploads", {
    body: {
      headerImage: headerImage?.name,
      inlineImages: inlineImages.map((image) => image.name),
    },
  });
  if (upload.status !== 200) return upload;

  const { uploadId } = upload.body as { uploadId: string };
  const images = headerImage ? [headerImage, ...inlineImages] : inlineImages;

  for (const { name, data } of images) {
    const uploaded = await uploadImage(`${uploadId}/images/${name}`, data);
    if (uploaded.status !== 200) return uploaded;
  }

  return apiCall(method, path, { body: { ...body, uploadId }, token });
};

export const createPost = (request: PostRequest, token?: string | null) =>
  sendWithImages("post", "", request, token);

export const updatePost = (
  post: PostDocument,
  request: PostRequest,
  token?: string | null,
) => sendWithImages("patch", `/${post._id.toString()}`, request, token);

export const postImage = (name: string, data: Buffer): NamedImage => ({
  name,
  data,
});

export const validBody = (overrides: Record<string, unknown> = {}) => ({
  title: TITLE,
  content: CONTENT,
  headerImage: postImage(HEADER_IMAGE_NAME, PNG_IMAGE),
  ...overrides,
});

export const storedUploads = () =>
  readdir(resolveStoragePath("uploads")).catch(() => []);

export const headerImageFile = (revision: StoredPostRevision) => {
  const file = revision.headerImage?.file;
  if (!file) {
    throw new Error(`Revision ${revision.fingerprint} has no header image.`);
  }

  return file;
};

export const storedFile = (file: string) => readFile(resolveStoragePath(file));

export const storedText = (file: string) =>
  readFile(resolveStoragePath(file), "utf8");

export const storedInode = async (file: string) =>
  (await stat(resolveStoragePath(file))).ino;

export const currentRevision = (post: PostDocument) =>
  post.revisions[post.revisions.length - 1];

export const imageResponse = (
  postId: string,
  name: string,
  data: Buffer,
  contentType: string,
) => ({
  name,
  contentType,
  byteSize: data.byteLength,
  path: postImagePath(postId, name),
  reference: postImageReference(name),
});

export const headerImageResponse = (postId: string) =>
  imageResponse(postId, HEADER_IMAGE_NAME, PNG_IMAGE, "image/png");

export const postSummaryResponse = (
  post: PostDocument,
  overrides: Partial<PostSummary> = {},
): PostSummary => ({
  _id: post._id.toString(),
  title: TITLE,
  authorUserId: admin._id,
  authorUsername: admin.username,
  createdDate: post.createdDate.toISOString(),
  modifiedDate: post.modifiedDate.toISOString(),
  revision: currentRevision(post).fingerprint,
  headerImage: headerImageResponse(post._id.toString()),
  ...overrides,
});

export const postResponse = (
  post: PostDocument,
  overrides: Partial<Post> = {},
): Post => ({
  ...postSummaryResponse(post, overrides),
  content: CONTENT,
  inlineImages: [],
  ...overrides,
});

export const responsePost = (response: Response) =>
  (response.body as { post: Post }).post;

export const expectFailure = (
  response: Response,
  status: number,
  message: string,
) => {
  expect(response.status).toBe(status);
  expect(response.body).toEqual({ error: true, message });
};

export const beforeEachPostTest = () => {
  vi.stubEnv("API_SESSION_SECRET", "test-api-session-secret");
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    loggedErrors.push(args);
  });
  stubUserLookup(admin);
  stubSave();
  vi.spyOn(PostModel, "exists").mockImplementation(
    () =>
      Promise.resolve(null) as unknown as ReturnType<typeof PostModel.exists>,
  );
};

export const afterEachPostTest = async () => {
  storageControl.cleanupFails = false;
  loggedErrors.splice(0);

  for (const post of savedPosts.splice(0)) {
    await deletePostStorage(post.fingerprint);
  }

  await rm(resolveStoragePath("uploads"), { recursive: true, force: true });

  vi.unstubAllEnvs();
  vi.restoreAllMocks();
};
