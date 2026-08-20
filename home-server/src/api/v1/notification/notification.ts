import { Router } from "express";
import { GetNotificationsResponse } from "@home/shared";
import { authenticateApiToken } from "../auth/authenticateApiToken";
import { sendSuccess, sendUnauthenticated } from "../http/respond";
import { handleGetNotifications } from "./handlers/handleGetNotifications";

const notificationRouter = Router();

notificationRouter.get("/", async (req, res) => {
  const verifiedToken = authenticateApiToken(req.headers?.authorization);
  if (verifiedToken.error) return sendUnauthenticated(res);

  const notifications = await handleGetNotifications(
    verifiedToken.decodedToken.user._id,
  );

  sendSuccess<GetNotificationsResponse>(res, { message: "", notifications });
});

notificationRouter.patch("/:id/read", (req, res) => {
  const notificationId = req.params.id;

  res
    .status(200)
    .send({ message: `Mark notification ${notificationId} as read.` });
});

notificationRouter.get("/stream", (req, res) => {
  res.status(200).send({ message: "Open notification stream" });
});

export default notificationRouter;
