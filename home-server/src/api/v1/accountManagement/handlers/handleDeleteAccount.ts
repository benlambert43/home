import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import { DeleteAccountResponse, EncodedAccountJwt } from "@home/shared";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { NotificationModel } from "../../model/notificationModel";
import { PasswordResetModel } from "../../model/passwordResetModel";
import { UserModel } from "../../model/userModel";
import { ApiMessage } from "../../http/messages";

const anonymizeEmailRecords = async (user: {
  _id: Types.ObjectId;
  email: string;
}) => {
  const anonymizedEmail = `accountdeleted${randomUUID()}@example.com`;
  const anonymized = [
    {
      $set: {
        userId: new Types.ObjectId(),
        email: anonymizedEmail,
        gmailApiResponse: {
          $replaceAll: {
            input: "$gmailApiResponse",
            find: { $literal: user.email },
            replacement: anonymizedEmail,
          },
        },
      },
    },
  ];
  const options = { updatePipeline: true };

  await Promise.all([
    EmailVerificationModel.updateMany(
      { userId: user._id },
      anonymized,
      options,
    ),
    PasswordResetModel.updateMany({ userId: user._id }, anonymized, options),
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
  await anonymizeEmailRecords(foundUser);
  await UserModel.findByIdAndDelete(foundUser._id);

  return { error: false, message: ApiMessage.ACCOUNT_DELETED };
};
