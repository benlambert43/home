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
  postIdParamsSchema,
  postImageParamsSchema,
  postListQuerySchema,
  postThumbnailParamsSchema,
  PostThumbnailSize,
  postUploadImageParamsSchema,
  postUploadParamsSchema,
  updatePostBodySchema,
} from "@home/shared";
import { authenticateApiToken } from "../auth/authenticateApiToken";
import { STORAGE_ROOT } from "../fileOperations/storagePath";
import { resumePostUpload } from "../fileOperations/uploadStorage";
import { ApiError } from "../http/apiError";
import { ApiMessage } from "../http/messages";
import { parseRequest } from "../http/parseRequest";
import { requireAdmin } from "../http/requireAdmin";
import {
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

const imageHeaders = (contentType: string, etag: string) => ({
  "Content-Type": contentType,
  "Content-Disposition": "inline",
  "X-Content-Type-Options": "nosniff",
  ETag: `"${etag}"`,
  "Cache-Control": `public, max-age=${IMAGE_CACHE_SECONDS}, must-revalidate`,
});

const sendImage = (res: Response, image: PostImageFile) =>
  new Promise<void>((resolve, reject) => {
    res.sendFile(
      image.file,
      {
        root: STORAGE_ROOT,
        headers: imageHeaders(image.contentType, image.etag),
      },
      (error) => {
        if (!error || res.headersSent) return resolve();

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
  "/:id/images/:name/fullSize",
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

    const result = await withReceivedPostImage(
      req,
      res,
      params.uploadId,
      (image) =>
        handleUploadPostImage(params.uploadId, manifest, params.name, image),
    );

    sendResult(res, result);
  }),
);

export default postRouter;
