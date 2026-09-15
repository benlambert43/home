import express, { Request, RequestHandler, Response, Router } from "express";
import {
  createPostBodySchema,
  createPostUploadBodySchema,
  DeletePostResponse,
  DeletePostUploadResponse,
  GetPostResponse,
  GetPostsResponse,
  MAX_POST_REQUEST_BODY_BYTES,
  postIdParamsSchema,
  postInlineImageParamsSchema,
  postListQuerySchema,
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
  findPostHeaderImage,
  findPostInlineImage,
  handleGetPostHeaderImage,
  handleGetPostInlineImage,
  PostImageFile,
  StoredPostImage,
} from "./handlers/handleGetPostImage";
import { handleGetPosts } from "./handlers/handleGetPosts";
import { handleUpdatePost } from "./handlers/handleUpdatePost";
import {
  handleUploadPostHeaderImage,
  handleUploadPostInlineImage,
} from "./handlers/handleUploadPostImage";
import { discardPostUploadIn, discardPostUploadOnFailure } from "./postUploads";
import { withReceivedPostImage } from "./uploadImage";

const IMAGE_CACHE_SECONDS = 60;

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

const sendImage = (res: Response, image: PostImageFile) => {
  res.set(imageHeaders(image.contentType, image.etag));
  res.send(image.data);
};

const sendFullSizeImage = (res: Response, image: StoredPostImage) =>
  new Promise<void>((resolve, reject) => {
    res.sendFile(
      image.file.file,
      {
        root: STORAGE_ROOT,
        headers: imageHeaders(image.file.contentType, image.etag),
      },
      (error) => {
        if (!error || res.headersSent) return resolve();

        reject(
          new ApiError(
            ApiMessage.POST_FILES_UNAVAILABLE,
            500,
            `Could not send ${image.file.file}: ${String(error)}`,
          ),
        );
      },
    );
  });

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

    const body = createPostBodySchema.safeParse(req.body);

    if (!body.success) {
      await discardPostUploadIn(req.body);
      return sendFailure(res, ApiMessage.INVALID_REQUEST);
    }

    sendResult(res, await handleCreatePost(admin, body.data));
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

    const params = postIdParamsSchema.safeParse(req.params);
    const body = updatePostBodySchema.safeParse(req.body);

    if (!params.success || !body.success) {
      await discardPostUploadIn(req.body);
      return sendFailure(res, ApiMessage.INVALID_REQUEST);
    }

    const result = await handleUpdatePost(params.data.id, body.data);
    if (!result) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    sendResult(res, result);
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
  "/:id/headerImage",
  route(async (req, res) => {
    const params = parseRequest(postIdParamsSchema, req.params, res);
    if (!params) return;

    const image = await handleGetPostHeaderImage(params.id);
    if (!image) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    sendImage(res, image);
  }),
);

postRouter.get(
  "/:id/images/:name",
  route(async (req, res) => {
    const params = parseRequest(postInlineImageParamsSchema, req.params, res);
    if (!params) return;

    const image = await handleGetPostInlineImage(params.id, params.name);
    if (!image) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    sendImage(res, image);
  }),
);

postRouter.get(
  "/:id/headerImage/fullSize",
  route(async (req, res) => {
    const params = parseRequest(postIdParamsSchema, req.params, res);
    if (!params) return;

    const image = await findPostHeaderImage(params.id);
    if (!image) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    await sendFullSizeImage(res, image);
  }),
);

postRouter.get(
  "/:id/images/:name/fullSize",
  route(async (req, res) => {
    const params = parseRequest(postInlineImageParamsSchema, req.params, res);
    if (!params) return;

    const image = await findPostInlineImage(params.id, params.name);
    if (!image) return sendNotFound(res, ApiMessage.POST_NOT_FOUND);

    await sendFullSizeImage(res, image);
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
  "/uploads/:uploadId/headerImage",
  route(async (req: Request, res) => {
    const admin = await requireAdmin(req.headers?.authorization, res);
    if (!admin) return;

    const params = parseRequest(postUploadParamsSchema, req.params, res);
    if (!params) return;

    const manifest = await resumePostUpload(params.uploadId);
    if (!manifest) return sendNotFound(res, ApiMessage.POST_UPLOAD_NOT_FOUND);

    const result = await discardPostUploadOnFailure(params.uploadId, () =>
      withReceivedPostImage(req, res, params.uploadId, (image) =>
        handleUploadPostHeaderImage(params.uploadId, manifest, image),
      ),
    );

    sendResult(res, result);
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

    const result = await discardPostUploadOnFailure(params.uploadId, () =>
      withReceivedPostImage(req, res, params.uploadId, (image) =>
        handleUploadPostInlineImage(
          params.uploadId,
          manifest,
          params.name,
          image,
        ),
      ),
    );

    sendResult(res, result);
  }),
);

export default postRouter;
