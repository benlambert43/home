import { randomBytes } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  createPostUploadBodySchema,
  CreatePostUploadRequestBody,
} from "@home/shared";
import { FULL_SIZE_IMAGES_DIRECTORY } from "./postStorage";
import { resolveStoragePath } from "./storagePath";

const UPLOADS_DIRECTORY = "uploads";

const MANIFEST_NAME = "manifest.json";

const UPLOAD_ID_BYTES = 16;

const UPLOAD_LIFETIME_MILLISECONDS = 24 * 60 * 60 * 1000;

const uploadPath = (upload: string, ...names: string[]) =>
  resolveStoragePath(path.posix.join(UPLOADS_DIRECTORY, upload, ...names));

const whenMissing =
  <Fallback>(fallback: Fallback) =>
  (error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return fallback;
    }

    throw error;
  };

export const newPostUploadId = () =>
  randomBytes(UPLOAD_ID_BYTES).toString("hex");

export const createPostUpload = async (
  upload: string,
  manifest: CreatePostUploadRequestBody,
) => {
  await mkdir(uploadPath(upload, FULL_SIZE_IMAGES_DIRECTORY), {
    recursive: true,
  });
  await writeFile(uploadPath(upload, MANIFEST_NAME), JSON.stringify(manifest), {
    flag: "wx",
  });
};

export const readPostUploadManifest = async (
  upload: string,
): Promise<CreatePostUploadRequestBody | undefined> => {
  const manifest = await readFile(
    uploadPath(upload, MANIFEST_NAME),
    "utf8",
  ).catch(whenMissing(undefined));

  return manifest === undefined
    ? undefined
    : createPostUploadBodySchema.parse(JSON.parse(manifest));
};

export const deletePostUpload = (upload: string) =>
  rm(uploadPath(upload), { recursive: true, force: true });

export const deleteExpiredPostUploads = async () => {
  const uploads = await readdir(resolveStoragePath(UPLOADS_DIRECTORY)).catch(
    whenMissing([]),
  );

  await Promise.all(
    uploads.map(async (upload) => {
      const directory = await stat(uploadPath(upload)).catch(
        whenMissing(undefined),
      );

      if (
        directory &&
        Date.now() - directory.mtimeMs > UPLOAD_LIFETIME_MILLISECONDS
      ) {
        await deletePostUpload(upload);
      }
    }),
  );
};
