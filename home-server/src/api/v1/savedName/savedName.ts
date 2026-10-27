import { Router } from "express";
import {
  DeleteSavedNameResponse,
  GetSavedNamesResponse,
  lookupSavedNamesBodySchema,
  LookupSavedNamesResponse,
  saveNameBodySchema,
  SaveNameResponse,
  savedNameIdParamsSchema,
  savedNameListQuerySchema,
} from "@home/shared";
import { ApiMessage } from "../http/messages";
import { parseRequest } from "../http/parseRequest";
import { requireUser } from "../http/requireUser";
import { sendNotFound, sendSuccess } from "../http/respond";
import { route } from "../http/router";
import { handleDeleteSavedName } from "./handlers/handleDeleteSavedName";
import { handleGetSavedNames } from "./handlers/handleGetSavedNames";
import { handleLookupSavedNames } from "./handlers/handleLookupSavedNames";
import { handleSaveName } from "./handlers/handleSaveName";

const savedNameRouter = Router();

savedNameRouter.get(
  "/",
  route(async (req, res) => {
    const user = await requireUser(req.headers?.authorization, res);
    if (!user) return;

    const query = parseRequest(savedNameListQuerySchema, req.query, res);
    if (!query) return;

    sendSuccess<GetSavedNamesResponse>(
      res,
      await handleGetSavedNames(user._id, query),
    );
  }),
);

savedNameRouter.post(
  "/",
  route(async (req, res) => {
    const user = await requireUser(req.headers?.authorization, res);
    if (!user) return;

    const body = parseRequest(saveNameBodySchema, req.body, res);
    if (!body) return;

    const saved = await handleSaveName(user._id, body);

    sendSuccess<SaveNameResponse>(res, {
      message: saved.created
        ? ApiMessage.NAME_SAVED
        : ApiMessage.NAME_ALREADY_SAVED,
      ...saved,
    });
  }),
);

savedNameRouter.post(
  "/lookup",
  route(async (req, res) => {
    const user = await requireUser(req.headers?.authorization, res);
    if (!user) return;

    const body = parseRequest(lookupSavedNamesBodySchema, req.body, res);
    if (!body) return;

    sendSuccess<LookupSavedNamesResponse>(
      res,
      await handleLookupSavedNames(user._id, body),
    );
  }),
);

savedNameRouter.delete(
  "/:id",
  route(async (req, res) => {
    const user = await requireUser(req.headers?.authorization, res);
    if (!user) return;

    const params = parseRequest(savedNameIdParamsSchema, req.params, res);
    if (!params) return;

    const summary = await handleDeleteSavedName(user._id, params.id);
    if (!summary) return sendNotFound(res, ApiMessage.SAVED_NAME_NOT_FOUND);

    sendSuccess<DeleteSavedNameResponse>(res, {
      message: ApiMessage.SAVED_NAME_REMOVED,
      ...summary,
    });
  }),
);

export default savedNameRouter;
