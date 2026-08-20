import { VerifyEmailResponse } from "@home/shared";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { serializeUser } from "../../types/serialize";
import { removeNotification } from "../../notification/handlers/removeNotification";
import { ApiMessage } from "../../http/messages";

export const handleVerifyEmailCallback = async ({
  username,
  email,
  code,
}: {
  username: string;
  email: string;
  code: string;
}): Promise<VerifyEmailResponse> => {
  const user = await UserModel.findOne({ username, email }).lean();
  const emailVerification = await EmailVerificationModel.findOne({
    email,
    verificationCode: code,
  }).lean();

  if (!user || !emailVerification) {
    return { error: true, message: ApiMessage.VERIFICATION_LINK_INVALID };
  }

  if (user.confirmedEmail && emailVerification.verificationCodeClickedOn) {
    return { error: true, message: ApiMessage.EMAIL_ALREADY_CONFIRMED };
  }

  if (emailVerification.expiresDate.getTime() <= Date.now()) {
    return { error: true, message: ApiMessage.VERIFICATION_LINK_EXPIRED };
  }

  await EmailVerificationModel.findByIdAndUpdate(emailVerification._id, {
    verificationCodeClickedOn: true,
  });

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { confirmedEmail: true },
    { returnDocument: "after" },
  ).lean();

  if (!updatedUser) {
    return { error: true, message: ApiMessage.UNEXPECTED };
  }

  await removeNotification({
    recipientUserId: updatedUser._id,
    subtype: "confirmEmail",
  });

  return {
    error: false,
    message: ApiMessage.EMAIL_CONFIRMED,
    jwt: createApiToken(updatedUser),
    user: serializeUser(updatedUser),
  };
};
