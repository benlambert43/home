import mongoose from "mongoose";
import { notificationSchema } from "../schema/notificationSchema";

export const notificationModel = mongoose.model(
  "notification",
  notificationSchema,
);
