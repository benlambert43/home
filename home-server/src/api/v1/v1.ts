import { Router } from "express";
import accountManagementRouter from "./accountManagement/accountManagement";
import signInRouter from "./signIn/signIn";
import notificationRouter from "./notification/notification";
import postRouter from "./post/post";

const v1Router = Router();

v1Router.use("/accountManagement", accountManagementRouter);
v1Router.use("/signIn", signInRouter);
v1Router.use("/notifications", notificationRouter);
v1Router.use("/posts", postRouter);

export default v1Router;
