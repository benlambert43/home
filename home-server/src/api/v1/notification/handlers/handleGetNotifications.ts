import { Types } from "mongoose";
import { Notification } from "@home/shared";
import { NotificationModel } from "../../model/notificationModel";
import { serializeNotification } from "../../types/serialize";

export const handleGetNotifications = async (
  recipientUserId: Types.ObjectId | string,
): Promise<Notification[]> =>
  (
    await NotificationModel.find({ recipientUserId }).sort({ timestamp: -1 })
  ).map(serializeNotification);
