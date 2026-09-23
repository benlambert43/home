// Unit test helpers

import { readdir, readFile, rm } from "node:fs/promises";
import express from "express";
import { Types } from "mongoose";
import request, { Response } from "supertest";
import { expect, vi } from "vitest";
import {
  CreatePostUploadRequestBody,
  Post,
  POST_IMAGE_FIELD,
  postImagePath,
  postImageReference,
  PostSummary,
  UserNoPassword,
} from "@home/shared";
import { createApiToken } from "../auth/createApiToken";
import { handleRequestError } from "../http/handleRequestError";
import { PostModel } from "../model/postModel";
import { UserModel } from "../model/userModel";
import postRouter from "../post/post";
import {
  deletePostStorage,
  FULL_SIZE_IMAGES_DIRECTORY,
} from "../fileOperations/postStorage";
import { resolveStoragePath } from "../fileOperations/storagePath";
import { PostDocument, StoredPostRevision } from "../types/db";
import { queuedThumbnailsSettled } from "./storageTestControl";

export const PNG_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export const PNG_IMAGE_SIZE = { width: 1, height: 1 };

export const JPEG_IMAGE = Buffer.from(
  "/9j/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAABAAIDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKAAD//Z",
  "base64",
);

export const JPEG_IMAGE_SIZE = { width: 2, height: 1 };

export const NOT_AN_IMAGE = Buffer.from("# Markdown, not an image.", "utf8");

export const HEADER_IMAGE_NAME = "cover.png";

export const TITLE = "Building the blog";

export const CONTENT = "# Building the blog\n\nA first post about the API.\n";

export const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

export const MISSING_POST_ID = new Types.ObjectId().toHexString();

export const MISSING_UPLOAD_ID = "0".repeat(32);

export const savedPosts: PostDocument[] = [];

const app = express().use("/api/v1/posts", postRouter).use(handleRequestError);

const admin: UserNoPassword = {
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
};

const asQuery = <Result>(result: Result) => ({
  select: () => Promise.resolve(result),
  then: (resolve: (value: Result) => unknown) =>
    Promise.resolve(result).then(resolve),
});

const stubUserLookup = (user: UserNoPassword) => {
  vi.spyOn(UserModel, "findById").mockImplementation(
    () => asQuery(user) as unknown as ReturnType<typeof UserModel.findById>,
  );
  vi.spyOn(UserModel, "find").mockImplementation(
    () => asQuery([user]) as unknown as ReturnType<typeof UserModel.find>,
  );
};

const postDocumentPrototype = PostModel.prototype as {
  save: () => Promise<PostDocument>;
};

const stubSave = () =>
  vi.spyOn(postDocumentPrototype, "save").mockImplementation(function (
    this: PostDocument,
  ) {
    savedPosts.push(this);
    return Promise.resolve(this);
  });

export const stubPostLookup = (post: PostDocument | null) =>
  vi
    .spyOn(PostModel, "findById")
    .mockImplementation(
      () =>
        Promise.resolve(post) as unknown as ReturnType<
          typeof PostModel.findById
        >,
    );

export const stubPostList = (posts: PostDocument[]) => {
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

export const stubPostDelete = (post: PostDocument | null) =>
  vi
    .spyOn(PostModel, "findByIdAndDelete")
    .mockImplementation(
      () =>
        Promise.resolve(post) as unknown as ReturnType<
          typeof PostModel.findByIdAndDelete
        >,
    );

type ApiMethod = "get" | "post" | "patch" | "delete";

const apiRequest = (
  method: ApiMethod,
  path: string,
  token: string | null = createApiToken(admin),
) => {
  const call = request(app)[method](`/api/v1/posts${path}`);

  return token === null ? call : call.set("Authorization", token);
};

export const apiCall = async (
  method: ApiMethod,
  path: string,
  { body, token }: { body?: object; token?: string | null } = {},
) => {
  const call = apiRequest(method, path, token);
  const response = await (body === undefined ? call : call.send(body));

  await queuedThumbnailsSettled();

  return response;
};

const requireSuccess = (response: Response, attempt: string) => {
  if (response.status !== 200) {
    throw new Error(
      `Could not ${attempt} for this test: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  return response;
};

export const startUpload = async (manifest: CreatePostUploadRequestBody) => {
  const response = requireSuccess(
    await apiCall("post", "/uploads", { body: manifest }),
    "start an upload",
  );

  return (response.body as { uploadId: string }).uploadId;
};

export const uploadPostImage = (uploadId: string, name: string, data: Buffer) =>
  request(app)
    .put(`/api/v1/posts/uploads/${uploadId}/images/${name}`)
    .set("Authorization", createApiToken(admin))
    .attach(POST_IMAGE_FIELD, data, "image");

interface NamedImage {
  name: string;
  data: Buffer;
}

interface PostRequest {
  headerImage?: NamedImage;
  inlineImages?: NamedImage[];
  removeHeaderImage?: boolean;
  [field: string]: unknown;
}

export const postImage = (name: string, data: Buffer): NamedImage => ({
  name,
  data,
});

export const postWithHeaderImage = (
  overrides: Record<string, unknown> = {},
) => ({
  title: TITLE,
  content: CONTENT,
  headerImage: postImage(HEADER_IMAGE_NAME, PNG_IMAGE),
  ...overrides,
});

export const postWithoutHeaderImage = (
  overrides: Record<string, unknown> = {},
) => postWithHeaderImage({ headerImage: undefined, ...overrides });

const sendWithImages = async (
  method: "post" | "patch",
  path: string,
  { headerImage, inlineImages = [], removeHeaderImage, ...fields }: PostRequest,
  token?: string | null,
): Promise<Response> => {
  const body = removeHeaderImage ? { ...fields, headerImage: null } : fields;

  if (headerImage === undefined && inlineImages.length === 0) {
    return apiCall(method, path, { body, token });
  }

  const uploadId = await startUpload({
    headerImage: headerImage?.name,
    inlineImages: inlineImages.map((image) => image.name),
  });
  const images = headerImage ? [headerImage, ...inlineImages] : inlineImages;

  for (const { name, data } of images) {
    requireSuccess(
      await uploadPostImage(uploadId, name, data),
      `upload ${name}`,
    );
  }

  return apiCall(method, path, { body: { ...body, uploadId }, token });
};

export const createPost = (request: PostRequest, token?: string | null) =>
  sendWithImages("post", "", request, token);

export const updatePost = (post: PostDocument, request: PostRequest) =>
  sendWithImages("patch", `/${post._id.toString()}`, {
    title: TITLE,
    content: CONTENT,
    revision: currentRevision(post).fingerprint,
    ...request,
  });

export const postPath = (post: PostDocument) => `/${post._id.toString()}`;

export const imagePath = (
  post: PostDocument,
  name: string,
  size: "" | "/fullSize" = "",
) => `${postPath(post)}/images/${name}${size}`;

export const publishPost = async (
  request: PostRequest = postWithHeaderImage(),
) => {
  requireSuccess(await createPost(request), "publish a post");

  const post = savedPosts[savedPosts.length - 1];
  stubPostLookup(post);

  return post;
};

const uploadPath = (uploadId: string, ...names: string[]) =>
  resolveStoragePath(["uploads", uploadId, ...names].join("/"));

export const storedUploads = () =>
  readdir(resolveStoragePath("uploads")).catch(() => []);

export const stagedImages = (uploadId: string) =>
  readdir(uploadPath(uploadId, FULL_SIZE_IMAGES_DIRECTORY));

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

export const currentRevision = (post: PostDocument) =>
  post.revisions[post.revisions.length - 1];

export const imageResponse = (
  postId: string,
  name: string,
  data: Buffer,
  contentType: string,
  size: { width: number; height: number },
) => ({
  name,
  contentType,
  byteSize: data.byteLength,
  ...size,
  path: postImagePath(postId, name),
  reference: postImageReference(name),
});

export const headerImageResponse = (postId: string) =>
  imageResponse(
    postId,
    HEADER_IMAGE_NAME,
    PNG_IMAGE,
    "image/png",
    PNG_IMAGE_SIZE,
  );

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
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  stubUserLookup(admin);
  stubSave();
};

export const afterEachPostTest = async () => {
  try {
    for (const post of savedPosts.splice(0)) {
      await deletePostStorage(post.fingerprint);
    }

    await rm(resolveStoragePath("uploads"), { recursive: true, force: true });
  } finally {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  }
};
