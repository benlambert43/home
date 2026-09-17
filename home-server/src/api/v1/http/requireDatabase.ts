import { RequestHandler } from "express";
import mongoose from "mongoose";
import { ApiMessage } from "./messages";
import { sendFailure } from "./respond";

export const requireDatabase: RequestHandler = (_req, res, next) => {
  if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
    return next();
  }

  sendFailure(res, ApiMessage.DATABASE_UNAVAILABLE, 503);
};
