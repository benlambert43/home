import mongoose from "mongoose";
import { notificationSchema } from "../schema/notificationSchema";

export const NotificationModel = mongoose.model(
  "notification",
  notificationSchema,
);
