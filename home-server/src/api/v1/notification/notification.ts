import { Router } from "express";
import { GetNotificationsResponse } from "@home/shared";
import { authenticateApiToken } from "../auth/authenticateApiToken";
import {
  sendNotImplemented,
  sendSuccess,
  sendUnauthenticated,
} from "../http/respond";
import { route } from "../http/router";
import { handleGetNotifications } from "./handlers/handleGetNotifications";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  route(async (req, res) => {
    const token = authenticateApiToken(req.headers?.authorization);
    if (!token) return sendUnauthenticated(res);

    sendSuccess<GetNotificationsResponse>(res, {
      notifications: await handleGetNotifications(token.user._id),
    });
  }),
);

notificationRouter.patch("/:id/read", (req, res) => sendNotImplemented(res));

notificationRouter.get("/stream", (req, res) => sendNotImplemented(res));

export default notificationRouter;
