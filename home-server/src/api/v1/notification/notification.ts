import { Router } from "express";
import { authenticateApiToken } from "../auth/authenticateApiToken";
import { GetNotificationsResponse } from "../types/response";
import { handleGetNotifications } from "./handlers/handleGetNotifications";

const notificationRouter = Router();

notificationRouter.get("/", async (req, res) => {
  const unverifiedToken = req.headers?.authorization;
  const validAuthToken = authenticateApiToken(unverifiedToken);
  const { error, errorMsg, decodedToken } = validAuthToken;
  if (error === false && decodedToken) {
    const notifications = await handleGetNotifications(decodedToken.user._id);

    const getNotificationsResponse: GetNotificationsResponse = {
      error: false,
      message: "",
      notifications,
    };

    res.status(200).send(getNotificationsResponse);
    return;
  } else {
    const getNotificationsErrorResponse: GetNotificationsResponse = {
      error: false,
      message: errorMsg,
    };
    res.status(400).send(getNotificationsErrorResponse);
    return;
  }
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
