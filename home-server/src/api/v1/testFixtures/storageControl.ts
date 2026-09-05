export const storageControl = { cleanupFails: false };

interface PostStorage {
  deletePostStorage: (post: string) => Promise<void>;
}

export const failableStorage = <Storage extends PostStorage>(
  storage: Storage,
): Storage => ({
  ...storage,
  deletePostStorage: (post: string) =>
    storageControl.cleanupFails
      ? Promise.reject(new Error("storage is unreachable"))
      : storage.deletePostStorage(post),
});
