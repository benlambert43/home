// Unit test helpers

import { CreatePostUploadRequestBody } from "@home/shared";
import type { PostThumbnailsJob } from "../post/postThumbnails";

export const storageControl = {
  cleanupFails: false,
  uploadCreateFails: false,
  uploadCleanupFails: false,
  incomingImageCleanupFails: false,
  maxImageBytes: undefined as number | undefined,
};

const queuedThumbnails: Promise<void>[] = [];

const unreachable = () => Promise.reject(new Error("storage is unreachable"));

interface PostStorage {
  deletePostStorage: (post: string) => Promise<void>;
}

export const failableStorage = <Storage extends PostStorage>(
  storage: Storage,
): Storage => ({
  ...storage,
  deletePostStorage: (post: string) =>
    storageControl.cleanupFails
      ? unreachable()
      : storage.deletePostStorage(post),
});

interface UploadStorage {
  createPostUpload: (
    upload: string,
    manifest: CreatePostUploadRequestBody,
  ) => Promise<void>;
  deletePostUpload: (upload: string) => Promise<void>;
}

export const failableUploadStorage = <Storage extends UploadStorage>(
  storage: Storage,
): Storage => ({
  ...storage,
  createPostUpload: async (
    upload: string,
    manifest: CreatePostUploadRequestBody,
  ) => {
    await storage.createPostUpload(upload, manifest);
    if (storageControl.uploadCreateFails) await unreachable();
  },
  deletePostUpload: (upload: string) =>
    storageControl.uploadCleanupFails
      ? unreachable()
      : storage.deletePostUpload(upload),
});

interface FileRemoval {
  rm: (path: string, options?: { force?: boolean }) => Promise<void>;
}

export const failableIncomingImageRemoval = <FileSystem extends FileRemoval>(
  fileSystem: FileSystem,
): FileSystem => ({
  ...fileSystem,
  rm: (path: string, options?: { force?: boolean }) =>
    storageControl.incomingImageCleanupFails && path.includes("/incoming/")
      ? unreachable()
      : fileSystem.rm(path, options),
});

interface ImageByteLimit {
  MAX_POST_IMAGE_BYTES: number;
}

export const cappedImageBytes = <Shared extends ImageByteLimit>(
  shared: Shared,
): Shared => ({
  ...shared,
  get MAX_POST_IMAGE_BYTES() {
    return storageControl.maxImageBytes ?? shared.MAX_POST_IMAGE_BYTES;
  },
});

interface ThumbnailQueue {
  queuePostThumbnails: (job: PostThumbnailsJob) => Promise<void>;
}

export const trackedThumbnailQueue = <Queue extends ThumbnailQueue>(
  queue: Queue,
): Queue => ({
  ...queue,
  queuePostThumbnails: (job: PostThumbnailsJob) => {
    const done = queue.queuePostThumbnails(job);
    queuedThumbnails.push(done);
    return done;
  },
});

export const queuedThumbnailsSettled = async () => {
  while (queuedThumbnails.length > 0) {
    await Promise.all(queuedThumbnails.splice(0));
  }
};
