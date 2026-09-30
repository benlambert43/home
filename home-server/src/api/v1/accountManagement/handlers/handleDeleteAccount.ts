import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import { DeleteAccountResponse, EncodedAccountJwt } from "@home/shared";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { NotificationModel } from "../../model/notificationModel";
import { PasswordResetModel } from "../../model/passwordResetModel";
import { UserModel } from "../../model/userModel";
import { ApiMessage } from "../../http/messages";

const anonymizeEmailRecords = async (userId: Types.ObjectId) => {
  const anonymized = {
    userId: new Types.ObjectId(),
    email: `accountdeleted${randomUUID()}@example.com`,
  };

  await Promise.all([
    EmailVerificationModel.updateMany({ userId }, anonymized),
    PasswordResetModel.updateMany({ userId }, anonymized),
  ]);
};

export const handleDeleteAccount = async (
  decodedToken: EncodedAccountJwt,
): Promise<DeleteAccountResponse> => {
  const userId = decodedToken.user._id;

  const foundUser = await UserModel.findById(userId);

  if (!foundUser) {
    return { error: true, message: ApiMessage.UNEXPECTED };
  }

  await NotificationModel.deleteMany({ recipientUserId: foundUser._id });
  await anonymizeEmailRecords(foundUser._id);
  await UserModel.findByIdAndDelete(foundUser._id);

  return { error: false, message: ApiMessage.ACCOUNT_DELETED };
};
