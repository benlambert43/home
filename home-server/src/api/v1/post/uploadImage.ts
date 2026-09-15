import { rm } from "node:fs/promises";
import { Request, Response } from "express";
import multer, { MulterError } from "multer";
import { MAX_POST_IMAGE_BYTES, POST_IMAGE_FIELD } from "@home/shared";
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
    ? new ApiError(ApiMessage.REQUEST_TOO_LARGE, 413, error.message)
    : new ApiError(ApiMessage.INVALID_REQUEST, 400, error.message);

const receivePostImage = (req: Request, res: Response, uploadId: string) =>
  new Promise<ReceivedPostImage | undefined>((resolve, reject) => {
    void imageReceiver(uploadId)(req, res, (error: unknown) => {
      if (error instanceof MulterError) return reject(toApiError(error));
      if (error instanceof Error) return reject(error);

      resolve(req.file && { path: req.file.path, byteSize: req.file.size });
    });
  });

export const withReceivedPostImage = async <Result>(
  req: Request,
  res: Response,
  uploadId: string,
  use: (image: ReceivedPostImage | undefined) => Promise<Result>,
): Promise<Result> => {
  const image = await receivePostImage(req, res, uploadId);

  try {
    return await use(image);
  } finally {
    if (image) await rm(image.path, { force: true });
  }
};
