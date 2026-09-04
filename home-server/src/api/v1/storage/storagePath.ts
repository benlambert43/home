import path from "node:path";

const STORAGE_ROOT = path.resolve("storage");

export const resolveStoragePath = (relativePath: string) => {
  const resolved = path.resolve(STORAGE_ROOT, relativePath);

  if (
    resolved !== STORAGE_ROOT &&
    !resolved.startsWith(`${STORAGE_ROOT}${path.sep}`)
  ) {
    throw new Error(
      `Refusing to use a path outside of storage: ${relativePath}`,
    );
  }

  return resolved;
};
