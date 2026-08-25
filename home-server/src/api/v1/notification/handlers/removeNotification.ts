import { Types } from "mongoose";
import { NotificationModel } from "../../model/notificationModel";

export const removeNotification = async ({
  recipientUserId,
  subtype,
}: {
  recipientUserId: Types.ObjectId;
  subtype: string;
}) => {
  await NotificationModel.deleteMany({
    recipientUserId,
    subtype,
  });
};
