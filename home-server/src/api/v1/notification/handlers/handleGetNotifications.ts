import { Types } from "mongoose";
import { Notification } from "@home/shared";
import { notificationModel } from "../../model/notificationModel";
import { serializeNotification } from "../../types/serialize";

export const handleGetNotifications = async (
  recipientUserId: Types.ObjectId | string,
): Promise<Notification[]> => {
  const notifications = await notificationModel.find({
    recipientUserId: recipientUserId,
  });
  return notifications.map(serializeNotification);
};
