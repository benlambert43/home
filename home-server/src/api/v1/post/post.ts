import express, { Request, RequestHandler, Response, Router } from "express";
import {
  ApiResponse,
  createPostBodySchema,
  createPostUploadBodySchema,
  DeletePostResponse,
  DeletePostUploadResponse,
  GetPostResponse,
  GetPostsResponse,
  MAX_POST_REQUEST_BODY_BYTES,
  POST_FULL_SIZE_SEGMENT,
  postIdParamsSchema,
  postImageParamsSchema,
  postListQuerySchema,
  postThumbnailParamsSchema,
  PostThumbnailSize,
  postUploadImageNames,
  postUploadImageParamsSchema,
  postUploadParamsSchema,
  updatePostBodySchema,
} from "@home/shared";
import { authenticateApiToken } from "../auth/authenticateApiToken";
import { STORAGE_ROOT } from "../fileOperations/storagePath";
import { resumePostUpload } from "../fileOperations/uploadStorage";
import { ApiError } from "../http/apiError";
import { ApiMessage, imageNotInUpload } from "../http/messages";
import { parseRequest } from "../http/parseRequest";
import { requireAdmin } from "../http/requireAdmin";
import {
  sendFailure,
  sendForbidden,
  sendNotFound,
  sendResult,
  sendSuccess,
  sendUnauthenticated,
} from "../http/respond";
import { route } from "../http/router";
import { handleCreatePost } from "./handlers/handleCreatePost";
import { handleCreatePostUpload } from "./handlers/handleCreatePostUpload";
import { handleDeletePost } from "./handlers/handleDeletePost";
import { handleDeletePostUpload } from "./handlers/handleDeletePostUpload";
import { handleGetPost } from "./handlers/handleGetPost";
import {
  findPostImage,
  findPostThumbnail,
  PostImageFile,
} from "./handlers/handleGetPostImage";
import { handleGetPosts } from "./handlers/handleGetPosts";
import { handleUpdatePost } from "./handlers/handleUpdatePost";
import { handleUploadPostImage } from "./handlers/handleUploadPostImage";
import { PostWrite, queuePostThumbnails } from "./postThumbnails";
import { withReceivedPostImage } from "./uploadImage";

const IMAGE_CACHE_SECONDS = 60;

const DEFAULT_IMAGE_SIZE: PostThumbnailSize = "large";

const adminBodyGuard: RequestHandler = (req, res, next) => {
  const token = authenticateApiToken(req.headers?.authorization);

  if (!token) return sendUnauthenticated(res);
  if (token.user.role !== "admin") return sendForbidden(res);

  next();
};

const parsePostBody = express.json({ limit: MAX_POST_REQUEST_BODY_BYTES });

interface SendFileError extends Error {
  status?: number;
  headers?: Record<string, string>;
}

const imageHeaders = (contentType: string, etag: string) => ({
  "Content-Type": contentType,
  "Content-Disposition": "inline",
  "X-Content-Type-Options": "nosniff",
  ETag: `"${etag}"`,
  "Cache-Control": `public, max-age=${IMAGE_CACHE_SECONDS}, must-revalidate`,
});

const imageRequestFailure = (status: number | undefined) => {
  if (status === 412) return { status, message: ApiMessage.POST_IMAGE_CHANGED };

  if (status === 416) {
    return { status, message: ApiMessage.POST_IMAGE_RANGE_NOT_SATISFIABLE };
  }

  return undefined;
};

const sendImage = (res: Response, image: PostImageFile) =>
  new Promise<void>((resolve, reject) => {
    const earlierHeaders = new Set(res.getHeaderNames());

    res.sendFile(
      image.file,
      {
        root: STORAGE_ROOT,
        headers: imageHeaders(image.contentType, image.etag),
      },
      (error?: SendFileError) => {
        if (!error || res.headersSent) return resolve();

        res
          .getHeaderNames()
          .filter((name) => !earlierHeaders.has(name))
          .forEach((name) => res.removeHeader(name));

        const failure = imageRequestFailure(error.status);

        if (failure) {
          res.set(error.headers ?? {});
          sendFailure(res, failure.message, failure.status);
          return resolve();
        }

        reject(
          new ApiError(
            ApiMessage.POST_FILES_UNAVAILABLE,
            500,
            `Could not send ${image.file}: ${String(error)}`,
          ),
        );
      },
    );
  });

const sendPostWrite = (
  res: Response,
  { response, thumbnails }: PostWrite<ApiResponse>,
) => {
  sendResult(res, response);
  if (thumbnails) void queuePostThumbnails(thumbnails);
};

const postRouter = Router();

postRouter.get(
  "/",
  route(async (req, res) => {
    const query = parseRequest(postListQuerySchema, req.query, res);
    if (!query) return;

    sendSuccess<GetPostsResponse>(res, await handleGetPosts(query));
  }),
);

postRouter.post(
  "/",
  adminBodyGuard,
  parsePostBody,
  route(async (req, res) => {
    const admin = await requireAdmin(req.headers?.authorization, res);
    if (!admin) return;

    const body = parseRequest(createPostBodySchema, req.body, res);
    if (!body) return;

    sendPostWrite(res, await handleCreatePost(admin, body));
  }),
);

postRouter.get(
  "/:id",
  route(async (req, res) => {
    const params = parseRequest(postIdParamsSchema, req.params, res);
    if (!params) return;

    const post = await handleGetPost(params.id);
    if (!post) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    sendSuccess<GetPostResponse>(res, { post });
  }),
);

postRouter.patch(
  "/:id",
  adminBodyGuard,
  parsePostBody,
  route(async (req, res) => {
    const admin = await requireAdmin(req.headers?.authorization, res);
    if (!admin) return;

    const params = parseRequest(postIdParamsSchema, req.params, res);
    if (!params) return;

    const body = parseRequest(updatePostBodySchema, req.body, res);
    if (!body) return;

    const written = await handleUpdatePost(params.id, body);
    if (!written) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    sendPostWrite(res, written);
  }),
);

postRouter.delete(
  "/:id",
  route(async (req, res) => {
    const admin = await requireAdmin(req.headers?.authorization, res);
    if (!admin) return;

    const params = parseRequest(postIdParamsSchema, req.params, res);
    if (!params) return;

    if (!(await handleDeletePost(params.id))) {
      return sendNotFound(res, ApiMessage.POST_NOT_FOUND);
    }

    sendSuccess<DeletePostResponse>(res, { message: ApiMessage.POST_DELETED });
  }),
);

postRouter.get(
  "/:id/images/:name",
  route(async (req, res) => {
    const params = parseRequest(postImageParamsSchema, req.params, res);
    if (!params) return;

    const image = await findPostThumbnail(
      params.id,
      params.name,
      DEFAULT_IMAGE_SIZE,
    );
    if (!image) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    await sendImage(res, image);
  }),
);

postRouter.get(
  `/:id/images/:name/${POST_FULL_SIZE_SEGMENT}`,
  route(async (req, res) => {
    const params = parseRequest(postImageParamsSchema, req.params, res);
    if (!params) return;

    const image = await findPostImage(params.id, params.name);
    if (!image) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    await sendImage(res, image);
  }),
);

postRouter.get(
  "/:id/images/:name/:size",
  route(async (req, res) => {
    const params = parseRequest(postThumbnailParamsSchema, req.params, res);
    if (!params) return;

    const image = await findPostThumbnail(params.id, params.name, params.size);
    if (!image) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    await sendImage(res, image);
  }),
);

postRouter.post(
  "/uploads",
  adminBodyGuard,
  parsePostBody,
  route(async (req, res) => {
    const admin = await requireAdmin(req.headers?.authorization, res);
    if (!admin) return;

    const body = parseRequest(createPostUploadBodySchema, req.body, res);
    if (!body) return;

    sendResult(res, await handleCreatePostUpload(body));
  }),
);

postRouter.delete(
  "/uploads/:uploadId",
  route(async (req, res) => {
    const admin = await requireAdmin(req.headers?.authorization, res);
    if (!admin) return;

    const params = parseRequest(postUploadParamsSchema, req.params, res);
    if (!params) return;

    if (!(await handleDeletePostUpload(params.uploadId))) {
      return sendNotFound(res, ApiMessage.POST_UPLOAD_NOT_FOUND);
    }

    sendSuccess<DeletePostUploadResponse>(res, {
      message: ApiMessage.POST_UPLOAD_DISCARDED,
    });
  }),
);

postRouter.put(
  "/uploads/:uploadId/images/:name",
  route(async (req: Request, res) => {
    const admin = await requireAdmin(req.headers?.authorization, res);
    if (!admin) return;

    const params = parseRequest(postUploadImageParamsSchema, req.params, res);
    if (!params) return;

    const manifest = await resumePostUpload(params.uploadId);
    if (!manifest) return sendNotFound(res, ApiMessage.POST_UPLOAD_NOT_FOUND);

    if (!postUploadImageNames(manifest).includes(params.name)) {
      return sendFailure(res, imageNotInUpload(params.name));
    }

    const result = await withReceivedPostImage(
      req,
      res,
      params.uploadId,
      (image) => handleUploadPostImage(params.uploadId, params.name, image),
    );

    sendResult(res, result);
  }),
);

export default postRouter;
