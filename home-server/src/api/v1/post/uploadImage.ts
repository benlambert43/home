import { rm } from "node:fs/promises";
import { Request, Response } from "express";
import multer, { MulterError } from "multer";
import { MAX_POST_IMAGE_BYTES, POST_IMAGE_FIELD } from "@home/shared";
import { isMissing, isSystemError } from "../fileOperations/fileErrors";
import { incomingPostUploadPath } from "../fileOperations/uploadStorage";
import { ApiError } from "../http/apiError";
import { ApiMessage } from "../http/messages";

export interface ReceivedPostImage {
  path: string;
  byteSize: number;
}

const imageReceiver = (uploadId: string) =>
  multer({
    storage: multer.diskStorage({
      destination: (_req, _file, callback) =>
        callback(null, incomingPostUploadPath(uploadId)),
    }),
    limits: { files: 1, fields: 0, fileSize: MAX_POST_IMAGE_BYTES },
  }).single(POST_IMAGE_FIELD);

const toApiError = (error: MulterError) =>
  error.code === "LIMIT_FILE_SIZE"
    ? new ApiError(ApiMessage.POST_IMAGE_TOO_LARGE, 413, error.message)
    : new ApiError(ApiMessage.INVALID_REQUEST, 400, error.message);

const unreadableUpload = (error: Error) =>
  new ApiError(ApiMessage.POST_IMAGE_UNREADABLE, 400, error.message);

const receivePostImage = (req: Request, res: Response, uploadId: string) =>
  new Promise<ReceivedPostImage | undefined>((resolve, reject) => {
    void imageReceiver(uploadId)(req, res, (error: unknown) => {
      if (error instanceof MulterError) return reject(toApiError(error));
      if (isSystemError(error)) return reject(error);
      if (error instanceof Error) return reject(unreadableUpload(error));

      resolve(req.file && { path: req.file.path, byteSize: req.file.size });
    });
  });

const discardIncomingImage = (file: string) =>
  rm(file, { force: true }).catch((e: unknown) => {
    console.error(`Failed to clean up incoming image ${file}:`, e);
  });

export const withReceivedPostImage = async <Result>(
  req: Request,
  res: Response,
  uploadId: string,
  use: (image: ReceivedPostImage | undefined) => Promise<Result>,
): Promise<Result> => {
  let image: ReceivedPostImage | undefined;

  try {
    image = await receivePostImage(req, res, uploadId);
    return await use(image);
  } catch (e) {
    if (!isMissing(e)) throw e;

    throw new ApiError(ApiMessage.POST_UPLOAD_NOT_FOUND, 404, String(e));
  } finally {
    if (image) await discardIncomingImage(image.path);
  }
};
