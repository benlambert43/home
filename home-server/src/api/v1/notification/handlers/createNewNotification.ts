import { Types } from "mongoose";
import { Notification } from "../../types/types";
import { notificationModel } from "../../model/notificationModel";

export const createNewNotification = async (n: {
  recipientUserId: Types.ObjectId;
  subtype: string;
  message: string;
  referenceLink: string;
  canBeMarkedAsRead: boolean;
  canBeDeleted: boolean;
}) => {
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
  return saveNewNotification as Notification;
};
