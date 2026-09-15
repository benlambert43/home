import { randomBytes } from "node:crypto";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
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

export const INCOMING_UPLOADS_PATH = resolveStoragePath(INCOMING_DIRECTORY);

const uploadFile = (upload: string, ...names: string[]) =>
  path.posix.join(UPLOADS_DIRECTORY, upload, ...names);

const uploadPath = (upload: string, ...names: string[]) =>
  resolveStoragePath(uploadFile(upload, ...names));

const isMissing = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ENOENT";

export const newPostUploadId = () =>
  randomBytes(UPLOAD_ID_BYTES).toString("hex");

export const deleteTemporaryPostUploads = () =>
  Promise.all(
    [UPLOADS_DIRECTORY, INCOMING_DIRECTORY].map((directory) =>
      rm(resolveStoragePath(directory), { recursive: true, force: true }),
    ),
  );

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
  try {
    return createPostUploadBodySchema.parse(
      JSON.parse(await readFile(uploadPath(upload, MANIFEST_NAME), "utf8")),
    );
  } catch (e) {
    if (isMissing(e)) return undefined;
    throw e;
  }
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
