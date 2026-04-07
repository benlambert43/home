import { Types } from "mongoose";
import { notificationModel } from "../../model/notificationModel";

export const handleGetNotifications = async (
  recipientUserId: Types.ObjectId,
) => {
  const notifications = await notificationModel.find({
    recipientUserId: recipientUserId,
  });
  return notifications;
};
