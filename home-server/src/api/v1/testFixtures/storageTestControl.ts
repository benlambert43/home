// Unit test helpers

import { CreatePostUploadRequestBody } from "@home/shared";

export const storageControl = {
  cleanupFails: false,
  uploadCreateFails: false,
  uploadCleanupFails: false,
  maxImageBytes: undefined as number | undefined,
};

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
