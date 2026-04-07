import { Types } from "mongoose";
import { notificationModel } from "../../model/notificationModel";

export const removeNotification = async ({
  recipientUserId,
  subtype,
}: {
  recipientUserId: Types.ObjectId;
  subtype: string;
}) => {
  await notificationModel.deleteMany({
    recipientUserId,
    subtype,
  });
};
