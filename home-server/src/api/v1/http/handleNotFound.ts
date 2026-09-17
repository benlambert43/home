import { RequestHandler } from "express";
import { ApiMessage } from "./messages";
import { sendNotFound } from "./respond";

export const handleNotFound: RequestHandler = (_req, res) =>
  sendNotFound(res, ApiMessage.ENDPOINT_NOT_FOUND);
