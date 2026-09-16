// Unit test helpers

import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
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
import { queuedThumbnailsSettled, storageControl } from "./storageTestControl";

export const PNG_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export const OTHER_PNG_IMAGE = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

export const LONGER_PNG_IMAGE = Buffer.concat([PNG_IMAGE, Buffer.alloc(8)]);

export const JPEG_IMAGE = Buffer.from(
  "ffd8ffe000104a46494600010100000100010000fffe0004686900ffd9",
  "hex",
);

export const WEBP_IMAGE = Buffer.concat([
  Buffer.from("RIFF", "latin1"),
  Buffer.from([0x1a, 0x00, 0x00, 0x00]),
  Buffer.from("WEBPVP8L", "latin1"),
  Buffer.alloc(18),
]);

export const GIF_IMAGE = Buffer.concat([
  Buffer.from("GIF89a", "latin1"),
  Buffer.from([0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00]),
]);

export const avifImage = (brand: string) =>
  Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x20]),
    Buffer.from(`ftyp${brand}${brand}mif1miaf`, "latin1"),
    Buffer.alloc(12),
  ]);

export const NOT_AN_IMAGE = Buffer.from("# Markdown, not an image.", "utf8");

export const HEADER_IMAGE_NAME = "cover.png";

export const TITLE = "Building the blog";

export const CONTENT = "# Building the blog\n\nA first post about the API.\n";

export const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

export const MISSING_POST_ID = new Types.ObjectId().toHexString();

export const MISSING_UPLOAD_ID = "0".repeat(32);

export const savedPosts: PostDocument[] = [];

export const loggedErrors: unknown[][] = [];

const app = express().use("/api/v1/posts", postRouter).use(handleRequestError);

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

const admin = makeUser();

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

export const stubPostExists = (exists: boolean | Error) =>
  vi
    .spyOn(PostModel, "exists")
    .mockImplementation(
      () =>
        (exists instanceof Error
          ? Promise.reject(exists)
          : Promise.resolve(
              exists ? { _id: new Types.ObjectId() } : null,
            )) as unknown as ReturnType<typeof PostModel.exists>,
    );

type ApiMethod = "get" | "post" | "patch" | "delete";

export const apiRequest = (
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

export const putPostImage = (
  uploadId: string,
  name: string,
  token: string | null = createApiToken(admin),
) => {
  const call = request(app).put(
    `/api/v1/posts/uploads/${uploadId}/images/${name}`,
  );

  return token === null ? call : call.set("Authorization", token);
};

export const uploadPostImage = (uploadId: string, name: string, data: Buffer) =>
  putPostImage(uploadId, name).attach(POST_IMAGE_FIELD, data, "image");

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
  sendWithImages("patch", `/${post._id.toString()}`, request);

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

export const writeStagedImage = (
  uploadId: string,
  name: string,
  data: Buffer,
) => writeFile(uploadPath(uploadId, FULL_SIZE_IMAGES_DIRECTORY, name), data);

export const corruptUploadManifest = (uploadId: string) =>
  writeFile(uploadPath(uploadId, "manifest.json"), "{ not json");

export const removeIncomingDirectory = (uploadId: string) =>
  rm(uploadPath(uploadId, "incoming"), { recursive: true, force: true });

export const removeStagedImageDirectory = (uploadId: string) =>
  rm(uploadPath(uploadId, FULL_SIZE_IMAGES_DIRECTORY), {
    recursive: true,
    force: true,
  });

const UPLOAD_IDLE_MILLISECONDS = 24 * 60 * 60 * 1000;

export const makeUploadIdle = (uploadId: string) => {
  const idle = new Date(Date.now() - UPLOAD_IDLE_MILLISECONDS - 1000);

  return utimes(uploadPath(uploadId), idle, idle);
};

export const addDanglingUpload = (name: string) =>
  symlink("nowhere", uploadPath(name));

const replaceWithAFile = async (directory: string) => {
  await mkdir(path.dirname(directory), { recursive: true });
  await rm(directory, { recursive: true, force: true });
  await writeFile(directory, "not a directory");
};

export const breakPostStorage = (fingerprint: string) =>
  replaceWithAFile(resolveStoragePath(`blog-posts/${fingerprint}`));

export const breakUploadStorage = () =>
  replaceWithAFile(resolveStoragePath("uploads"));

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

export const storedEntries = (directory: string) =>
  readdir(resolveStoragePath(directory));

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

export const responseSummaries = (response: Response) =>
  (response.body as { posts: PostSummary[] }).posts;

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
  stubPostExists(false);
};

export const afterEachPostTest = async () => {
  storageControl.cleanupFails = false;
  storageControl.uploadCreateFails = false;
  storageControl.uploadCleanupFails = false;
  storageControl.incomingImageCleanupFails = false;
  storageControl.maxImageBytes = undefined;
  loggedErrors.splice(0);

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
