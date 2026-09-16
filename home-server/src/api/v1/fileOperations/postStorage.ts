import { randomUUID } from "node:crypto";
import { link, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  MAX_POST_THUMBNAIL_BYTES,
  POST_CONTENT_NAME,
  POST_THUMBNAIL_SIZES,
  PostThumbnailSize,
} from "@home/shared";
import { ApiError } from "../http/apiError";
import { ApiMessage } from "../http/messages";
import {
  revisionImages,
  StoredPostFile,
  StoredPostRevision,
} from "../types/db";
import { hasErrorCode, isMissing, unlessMissing } from "./fileErrors";
import { fingerprint } from "./fingerprint";
import { detectFileImageType } from "./imageType";
import { resolveStoragePath } from "./storagePath";
import { createThumbnail } from "./thumbnails";

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

const BLOG_POSTS_DIRECTORY = "blog-posts";

export const FULL_SIZE_IMAGES_DIRECTORY = "full_size_images";

const THUMBNAILS_DIRECTORY = "thumbnails";

const STORAGE_REMOVAL_RETRIES = 5;

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

export interface StoredThumbnail {
  size: PostThumbnailSize;
  file: string;
  contentType: string;
}

export interface ThumbnailFailure {
  size: PostThumbnailSize;
  error: unknown;
}

interface ThumbnailSource {
  file: string;
  byteSize: number;
}

const postDirectory = (post: string) =>
  path.posix.join(BLOG_POSTS_DIRECTORY, post);

const revisionDirectory = (post: string, revision: string) =>
  path.posix.join(postDirectory(post), revision);

const thumbnailsDirectory = (
  post: string,
  revision: string,
  size: PostThumbnailSize,
) =>
  path.posix.join(
    revisionDirectory(post, revision),
    THUMBNAILS_DIRECTORY,
    size,
  );

const thumbnailFile = (
  post: string,
  revision: string,
  size: PostThumbnailSize,
  name: string,
) => path.posix.join(thumbnailsDirectory(post, revision, size), name);

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

const storeFile = (directory: string, source: PostFileSource) => {
  if ("data" in source) return writeStoredFile(directory, source);

  return linkStoredFile(directory, source);
};

const markdownFile = (content: string): PostFileContent => ({
  name: `${POST_CONTENT_NAME}.md`,
  contentType: MARKDOWN_CONTENT_TYPE,
  data: Buffer.from(content, "utf8"),
});

export const deletePostRevision = (post: string, revision: string) =>
  rm(resolveStoragePath(revisionDirectory(post, revision)), {
    recursive: true,
    force: true,
  });

export const writePostRevision = async (
  post: string,
  { content, headerImage, inlineImages }: PostRevisionContent,
): Promise<StoredPostRevision> => {
  const createdDate = new Date();
  const revision = fingerprint(post, createdDate.toISOString(), randomUUID());
  const directory = revisionDirectory(post, revision);
  const fullSizeImages = path.posix.join(directory, FULL_SIZE_IMAGES_DIRECTORY);

  try {
    const stored: StoredPostRevision = {
      fingerprint: revision,
      createdDate,
      content: await storeFile(
        directory,
        typeof content === "string" ? markdownFile(content) : content,
      ),
      headerImage: headerImage
        ? await storeFile(fullSizeImages, headerImage)
        : undefined,
      inlineImages: await Promise.all(
        inlineImages.map((image) => storeFile(fullSizeImages, image)),
      ),
    };

    await Promise.all(
      [FULL_SIZE_IMAGES_DIRECTORY, THUMBNAILS_DIRECTORY].map((folder) =>
        mkdir(resolveStoragePath(path.posix.join(directory, folder)), {
          recursive: true,
        }),
      ),
    );

    return stored;
  } catch (e) {
    await deletePostRevision(post, revision).catch((cleanupError: unknown) => {
      console.error(
        `Failed to clean up storage for revision ${revision} of post ${post}:`,
        cleanupError,
      );
    });
    throw e;
  }
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
  rm(resolveStoragePath(postDirectory(post)), {
    recursive: true,
    force: true,
    maxRetries: STORAGE_REMOVAL_RETRIES,
  });

const isSameFile = async (first: string, second: string) => {
  const [firstStats, secondStats] = await Promise.all(
    [first, second].map((file) =>
      unlessMissing(() => stat(resolveStoragePath(file)), undefined),
    ),
  );

  return (
    firstStats !== undefined &&
    secondStats !== undefined &&
    firstStats.dev === secondStats.dev &&
    firstStats.ino === secondStats.ino
  );
};

const revisionWithSameImage = async (
  image: StoredPostFile,
  previous: StoredPostRevision | undefined,
) => {
  if (!previous) return undefined;

  const earlier = revisionImages(previous).find(
    (candidate) => candidate.name === image.name,
  );

  return earlier && (await isSameFile(earlier.file, image.file))
    ? previous.fingerprint
    : undefined;
};

const oversizedMarker = (absolutePath: string) => `${absolutePath}.oversized`;

const markOversized = (absolutePath: string) =>
  writeFile(oversizedMarker(absolutePath), "").catch((e: unknown) => {
    console.error(`Failed to mark ${absolutePath} as oversized:`, e);
  });

const prepareThumbnailFile = async (
  post: string,
  revision: string,
  size: PostThumbnailSize,
  name: string,
) => {
  const file = thumbnailFile(post, revision, size, name);
  const absolutePath = resolveStoragePath(file);

  try {
    await mkdir(path.dirname(absolutePath));
  } catch (e) {
    if (isMissing(e)) return undefined;
    if (!hasErrorCode(e, "EEXIST")) throw e;
  }

  return { file, absolutePath };
};

const reuseThumbnail = async (
  post: string,
  revision: string | undefined,
  size: PostThumbnailSize,
  name: string,
  absolutePath: string,
) => {
  if (revision === undefined) return false;

  const earlier = resolveStoragePath(thumbnailFile(post, revision, size, name));
  const earlierStats = await unlessMissing(() => stat(earlier), undefined);
  if (!earlierStats) return false;

  const oversized = earlierStats.size > MAX_POST_THUMBNAIL_BYTES[size];
  const reusable =
    !oversized ||
    (await unlessMissing(
      () => stat(oversizedMarker(earlier)).then(() => true),
      false,
    ));
  if (!reusable) return false;

  const reused = await unlessMissing(
    () => link(earlier, absolutePath).then(() => true),
    false,
  );
  if (reused && oversized) await markOversized(absolutePath);

  return reused;
};

const writeCompleteFile = async (absolutePath: string, data: Buffer) => {
  const temporaryPath = `${absolutePath}.${randomUUID()}.tmp`;

  try {
    await writeFile(temporaryPath, data, { flag: "wx" });
    await link(temporaryPath, absolutePath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
};

const makeThumbnail = async (
  source: ThumbnailSource,
  size: PostThumbnailSize,
  absolutePath: string,
) => {
  const data = await createThumbnail(
    resolveStoragePath(source.file),
    source.byteSize,
    MAX_POST_THUMBNAIL_BYTES[size],
  );
  if (!data) return false;

  await writeCompleteFile(absolutePath, data);

  return true;
};

export const writePostThumbnails = async (
  post: string,
  revision: StoredPostRevision,
  image: StoredPostFile,
  previous?: StoredPostRevision,
): Promise<ThumbnailFailure[]> => {
  const reusableRevision = await revisionWithSameImage(image, previous).catch(
    () => undefined,
  );
  const failures: ThumbnailFailure[] = [];
  let source: ThumbnailSource = image;

  for (const size of POST_THUMBNAIL_SIZES) {
    const fail = (error: unknown) => {
      failures.push({ size, error });
      return false;
    };

    try {
      const prepared = await prepareThumbnailFile(
        post,
        revision.fingerprint,
        size,
        image.name,
      );
      if (!prepared) return failures;

      const { file, absolutePath } = prepared;
      const stored =
        (await reuseThumbnail(
          post,
          reusableRevision,
          size,
          image.name,
          absolutePath,
        ).catch(fail)) ||
        (await makeThumbnail(source, size, absolutePath).catch(fail));

      if (!stored) {
        await link(resolveStoragePath(source.file), absolutePath);

        const failed = failures.some((failure) => failure.size === size);
        if (!failed && source.byteSize > MAX_POST_THUMBNAIL_BYTES[size]) {
          await markOversized(absolutePath);
        }
      }

      source = { file, byteSize: (await stat(absolutePath)).size };
    } catch (error) {
      fail(error);
    }
  }

  return failures;
};

const sizesFrom = (size: PostThumbnailSize) =>
  POST_THUMBNAIL_SIZES.slice(
    0,
    POST_THUMBNAIL_SIZES.indexOf(size) + 1,
  ).reverse();

export const findStoredThumbnail = async (
  post: string,
  revision: string,
  name: string,
  size: PostThumbnailSize,
): Promise<StoredThumbnail | undefined> => {
  for (const candidate of sizesFrom(size)) {
    const file = thumbnailFile(post, revision, candidate, name);
    const imageType = await unlessMissing(
      () => detectFileImageType(resolveStoragePath(file)),
      undefined,
    );

    if (imageType) {
      return { size: candidate, file, contentType: imageType.contentType };
    }
  }

  return undefined;
};
