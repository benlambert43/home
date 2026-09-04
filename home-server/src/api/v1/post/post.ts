import express, { RequestHandler, Response, Router } from "express";
import {
  createPostBodySchema,
  DeletePostResponse,
  GetPostResponse,
  GetPostsResponse,
  MAX_POST_REQUEST_BODY_BYTES,
  postIdParamsSchema,
  postInlineImageParamsSchema,
  postListQuerySchema,
  updatePostBodySchema,
} from "@home/shared";
import { authenticateApiToken } from "../auth/authenticateApiToken";
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
import { handleDeletePost } from "./handlers/handleDeletePost";
import { handleGetPost } from "./handlers/handleGetPost";
import {
  handleGetPostHeaderImage,
  handleGetPostInlineImage,
  PostImageFile,
} from "./handlers/handleGetPostImage";
import { handleGetPosts } from "./handlers/handleGetPosts";
import { handleUpdatePost } from "./handlers/handleUpdatePost";

const IMAGE_CACHE_SECONDS = 60;

const adminBodyGuard: RequestHandler = (req, res, next) => {
  const token = authenticateApiToken(req.headers?.authorization);

  if (!token) return sendUnauthenticated(res);
  if (token.user.role !== "admin") return sendForbidden(res);

  next();
};

const parsePostBody = express.json({ limit: MAX_POST_REQUEST_BODY_BYTES });

const sendImage = (res: Response, image: PostImageFile) => {
  res.setHeader("Content-Type", image.contentType);
  res.setHeader("Content-Disposition", "inline");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("ETag", `"${image.etag}"`);
  res.setHeader(
    "Cache-Control",
    `public, max-age=${IMAGE_CACHE_SECONDS}, must-revalidate`,
  );

  res.send(image.data);
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

    sendResult(res, await handleCreatePost(admin, body));
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

    const result = await handleUpdatePost(params.id, body);
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

export default postRouter;
