import { Router } from "express";

const notificationRouter = Router();

notificationRouter.get("/", (req, res) => {
  res.status(200).send({ message: "Notification Router" });
});

notificationRouter.patch("/:id/read", (req, res) => {
  const notificationId = req.params.id;

  res.status(200).send({ message: "Notification Router" });
});

notificationRouter.get("/stream", (req, res) => {
  res.status(200).send({ message: "Notification Router" });
});

export default notificationRouter;
