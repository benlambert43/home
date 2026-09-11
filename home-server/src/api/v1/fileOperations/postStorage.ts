import { link, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { POST_CONTENT_NAME, POST_INLINE_IMAGES_DIRECTORY } from "@home/shared";
import { ApiError } from "../http/apiError";
import { ApiMessage } from "../http/messages";
import { StoredPostFile, StoredPostRevision } from "../types/db";
import { fingerprint } from "./fingerprint";
import { resolveStoragePath } from "./storagePath";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

const BLOG_POSTS_DIRECTORY = "blog-posts";

export interface PostFileContent {
  name: string;
  contentType: string;
  data: Buffer;
}

export type PostFileSource = PostFileContent | StoredPostFile;

interface PostRevisionContent {
  content: string | StoredPostFile;
  headerImage?: PostFileSource;
  inlineImages: PostFileSource[];
}

const postDirectory = (post: string) =>
  path.posix.join(BLOG_POSTS_DIRECTORY, post);

const prepareStoredFile = async (directory: string, name: string) => {
  const file = path.posix.join(directory, name);
  const absolutePath = resolveStoragePath(file);

  await mkdir(path.dirname(absolutePath), { recursive: true });

  return { file, absolutePath };
};

const writeStoredFile = async (
  directory: string,
  { name, contentType, data }: PostFileContent,
): Promise<StoredPostFile> => {
  const { file, absolutePath } = await prepareStoredFile(directory, name);

  await writeFile(absolutePath, data, { flag: "wx" });

  return { name, file, contentType, byteSize: data.byteLength };
};

const linkStoredFile = async (
  directory: string,
  { name, file: original, contentType, byteSize }: StoredPostFile,
): Promise<StoredPostFile> => {
  const { file, absolutePath } = await prepareStoredFile(directory, name);

  try {
    await link(resolveStoragePath(original), absolutePath);
  } catch (e) {
    throw new ApiError(
      ApiMessage.POST_FILES_UNAVAILABLE,
      500,
      `Could not link ${original}: ${String(e)}`,
    );
  }

  return { name, file, contentType, byteSize };
};

const storeFile = (directory: string, source: PostFileSource) =>
  "data" in source
    ? writeStoredFile(directory, source)
    : linkStoredFile(directory, source);

const markdownFile = (content: string): PostFileContent => ({
  name: `${POST_CONTENT_NAME}.md`,
  contentType: MARKDOWN_CONTENT_TYPE,
  data: Buffer.from(content, "utf8"),
});

export const writePostRevision = async (
  post: string,
  { content, headerImage, inlineImages }: PostRevisionContent,
): Promise<StoredPostRevision> => {
  const createdDate = new Date();
  const revision = fingerprint(post, createdDate.toISOString());
  const directory = path.posix.join(postDirectory(post), revision);

  return {
    fingerprint: revision,
    createdDate,
    content: await storeFile(
      directory,
      typeof content === "string" ? markdownFile(content) : content,
    ),
    headerImage: headerImage
      ? await storeFile(directory, headerImage)
      : undefined,
    inlineImages: await Promise.all(
      inlineImages.map((image) =>
        storeFile(
          path.posix.join(directory, POST_INLINE_IMAGES_DIRECTORY),
          image,
        ),
      ),
    ),
  };
};

export const readPostFile = async (stored: StoredPostFile): Promise<Buffer> => {
  try {
    return await readFile(resolveStoragePath(stored.file));
  } catch (e) {
    throw new ApiError(
      ApiMessage.POST_FILES_UNAVAILABLE,
      500,
      `Could not read ${stored.file}: ${String(e)}`,
    );
  }
};

export const readPostContent = async (revision: StoredPostRevision) =>
  (await readPostFile(revision.content)).toString("utf8");

export const deletePostStorage = (post: string) =>
  rm(resolveStoragePath(postDirectory(post)), { recursive: true, force: true });
