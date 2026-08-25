import { Notification } from "@home/shared";
import { NotificationModel } from "../../model/notificationModel";
import { NotificationDocument } from "../../types/db";
import { serializeNotification } from "../../types/serialize";

type NewNotification = Omit<
  NotificationDocument,
  "_id" | "markedAsRead" | "timestamp"
>;

export const createNewNotification = async (
  n: NewNotification,
): Promise<Notification> => {
  const newNotification = new NotificationModel({
    ...n,
    markedAsRead: false,
    timestamp: new Date(),
  });
  return serializeNotification(await newNotification.save());
};
