import { randomBytes } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  createPostUploadBodySchema,
  CreatePostUploadRequestBody,
} from "@home/shared";
import { detectFileImageType } from "./imageType";
import { FULL_SIZE_IMAGES_DIRECTORY } from "./postStorage";
import { resolveStoragePath } from "./storagePath";

const UPLOADS_DIRECTORY = "uploads";

const INCOMING_DIRECTORY = "incoming";

const MANIFEST_NAME = "manifest.json";

const UPLOAD_ID_BYTES = 16;

const UPLOAD_IDLE_MILLISECONDS = 24 * 60 * 60 * 1000;

const uploadFile = (upload: string, ...names: string[]) =>
  path.posix.join(UPLOADS_DIRECTORY, upload, ...names);

const uploadPath = (upload: string, ...names: string[]) =>
  resolveStoragePath(uploadFile(upload, ...names));

const isMissing = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

const unlessMissing = async <Value, Fallback>(
  attempt: () => Promise<Value>,
  fallback: Fallback,
): Promise<Value | Fallback> => {
  try {
    return await attempt();
  } catch (e) {
    if (isMissing(e)) return fallback;
    throw e;
  }
};

export const newPostUploadId = () =>
  randomBytes(UPLOAD_ID_BYTES).toString("hex");

export const incomingPostUploadPath = (upload: string) =>
  uploadPath(upload, INCOMING_DIRECTORY);

export const deleteIdlePostUploads = async () => {
  const idleBefore = Date.now() - UPLOAD_IDLE_MILLISECONDS;
  const uploads = await unlessMissing(
    () => readdir(resolveStoragePath(UPLOADS_DIRECTORY)),
    [],
  );

  await Promise.all(
    uploads.map(async (upload) => {
      const directory = await unlessMissing(
        () => stat(uploadPath(upload)),
        undefined,
      );

      if (directory && directory.mtimeMs < idleBefore) {
        await deletePostUpload(upload);
      }
    }),
  );
};

export const createPostUpload = async (
  upload: string,
  manifest: CreatePostUploadRequestBody,
) => {
  await mkdir(uploadPath(upload, FULL_SIZE_IMAGES_DIRECTORY), {
    recursive: true,
  });
  await mkdir(incomingPostUploadPath(upload));
  await writeFile(uploadPath(upload, MANIFEST_NAME), JSON.stringify(manifest), {
    flag: "wx",
  });
};

export const readPostUploadManifest = async (
  upload: string,
): Promise<CreatePostUploadRequestBody | undefined> => {
  try {
    return createPostUploadBodySchema.parse(
      JSON.parse(await readFile(uploadPath(upload, MANIFEST_NAME), "utf8")),
    );
  } catch (e) {
    if (isMissing(e)) return undefined;
    throw e;
  }
};

export const resumePostUpload = async (upload: string) => {
  const now = new Date();
  const found = await unlessMissing(
    () => utimes(uploadPath(upload), now, now).then(() => true),
    false,
  );

  return found ? readPostUploadManifest(upload) : undefined;
};

export const listStagedPostImages = (upload: string) =>
  readdir(uploadPath(upload, FULL_SIZE_IMAGES_DIRECTORY));

export const stagePostImage = (
  upload: string,
  name: string,
  incomingPath: string,
) => rename(incomingPath, uploadPath(upload, FULL_SIZE_IMAGES_DIRECTORY, name));

export const inspectStagedPostImage = async (upload: string, name: string) => {
  const stagedFile = uploadFile(upload, FULL_SIZE_IMAGES_DIRECTORY, name);
  const absolutePath = resolveStoragePath(stagedFile);

  return {
    stagedFile,
    byteSize: (await stat(absolutePath)).size,
    imageType: await detectFileImageType(absolutePath),
  };
};

export const deletePostUpload = (upload: string) =>
  rm(uploadPath(upload), { recursive: true, force: true });
