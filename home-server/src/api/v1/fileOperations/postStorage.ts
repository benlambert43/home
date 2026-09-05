import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
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

interface PostRevisionContent {
  content: string;
  headerImage?: PostFileContent;
  inlineImages: PostFileContent[];
}

const postDirectory = (post: string) =>
  path.posix.join(BLOG_POSTS_DIRECTORY, post);

const writeStoredFile = async (
  directory: string,
  { name, contentType, data }: PostFileContent,
): Promise<StoredPostFile> => {
  const file = path.posix.join(directory, name);
  const absolutePath = resolveStoragePath(file);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, data, { flag: "wx" });

  return { name, file, contentType, byteSize: data.byteLength };
};

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
    content: await writeStoredFile(directory, {
      name: `${POST_CONTENT_NAME}.md`,
      contentType: MARKDOWN_CONTENT_TYPE,
      data: Buffer.from(content, "utf8"),
    }),
    headerImage: headerImage
      ? await writeStoredFile(directory, headerImage)
      : undefined,
    inlineImages: await Promise.all(
      inlineImages.map((image) =>
        writeStoredFile(
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

export const carryForward = async (
  stored: StoredPostFile,
): Promise<PostFileContent> => ({
  name: stored.name,
  contentType: stored.contentType,
  data: await readPostFile(stored),
});

export const readPostContent = async (revision: StoredPostRevision) =>
  (await readPostFile(revision.content)).toString("utf8");

export const deletePostStorage = (post: string) =>
  rm(resolveStoragePath(postDirectory(post)), { recursive: true, force: true });
