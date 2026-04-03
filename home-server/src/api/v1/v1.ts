import { Router } from "express";
import accountManagementRouter from "./accountManagement/accountManagement";
import signInRouter from "./signIn/signIn";
import userRouter from "./user/user";
import notificationRouter from "./notification/notification";

const v1Router = Router();

v1Router.get("/", (req, res) => {
  res.status(200).send({ message: "v1 Router" });
});

v1Router.use("/accountManagement", accountManagementRouter);
v1Router.use("/signIn", signInRouter);
v1Router.use("/user", userRouter);
v1Router.use("/notifications", notificationRouter);

export default v1Router;
