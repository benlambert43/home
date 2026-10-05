import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import { DeleteAccountResponse, EncodedAccountJwt } from "@home/shared";
import { clearSignInAttempts } from "../../auth/signInThrottle";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { NotificationModel } from "../../model/notificationModel";
import { PasswordResetModel } from "../../model/passwordResetModel";
import { UserModel } from "../../model/userModel";
import { ApiMessage } from "../../http/messages";

const withLowercaseDomain = (email: string) => {
  const domainStart = email.lastIndexOf("@");
  return email.slice(0, domainStart) + email.slice(domainStart).toLowerCase();
};

const replaceEmail = (input: unknown, email: string, replacement: string) => ({
  $replaceAll: { input, find: { $literal: email }, replacement },
});

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
        gmailApiResponse: replaceEmail(
          replaceEmail("$gmailApiResponse", user.email, anonymizedEmail),
          withLowercaseDomain(user.email),
          anonymizedEmail,
        ),
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
  await clearSignInAttempts(foundUser.email);
  await UserModel.findByIdAndDelete(foundUser._id);

  return { error: false, message: ApiMessage.ACCOUNT_DELETED };
};
