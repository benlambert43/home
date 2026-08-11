import { Types } from "mongoose";
import { Notification } from "@home/shared";
import { notificationModel } from "../../model/notificationModel";
import { serializeNotification } from "../../types/serialize";

export const createNewNotification = async (n: {
  recipientUserId: Types.ObjectId;
  subtype: string;
  message: string;
  referenceLink: string;
  canBeMarkedAsRead: boolean;
  canBeDeleted: boolean;
}): Promise<Notification> => {
  const newNotification = new notificationModel({
    recipientUserId: n.recipientUserId,
    subtype: n.subtype,
    message: n.message,
    referenceLink: n.referenceLink,
    markedAsRead: false,
    canBeMarkedAsRead: n.canBeMarkedAsRead,
    canBeDeleted: n.canBeDeleted,
    timestamp: new Date(),
  });
  const saveNewNotification = await newNotification.save();
  return serializeNotification(saveNewNotification);
};
