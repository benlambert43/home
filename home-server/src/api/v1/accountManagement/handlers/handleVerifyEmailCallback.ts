import { VerifyEmailResponse } from "@home/shared";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { hashEmailedCode } from "../../auth/emailedCode";
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

  if (!user) {
    return { error: true, message: ApiMessage.VERIFICATION_LINK_INVALID };
  }

  const emailVerification = await EmailVerificationModel.findOne({
    userId: user._id,
    verificationCodeHash: hashEmailedCode(code),
  }).lean();

  if (!emailVerification) {
    return { error: true, message: ApiMessage.VERIFICATION_LINK_INVALID };
  }

  if (emailVerification.verificationCodeClickedOn) {
    return {
      error: true,
      message: user.confirmedEmail
        ? ApiMessage.EMAIL_ALREADY_CONFIRMED
        : ApiMessage.VERIFICATION_LINK_INVALID,
    };
  }

  if (user.confirmedEmail) {
    return { error: true, message: ApiMessage.EMAIL_ALREADY_CONFIRMED };
  }

  if (emailVerification.expiresDate.getTime() <= Date.now()) {
    return { error: true, message: ApiMessage.VERIFICATION_LINK_EXPIRED };
  }

  const claimedVerification = await EmailVerificationModel.findOneAndUpdate(
    { _id: emailVerification._id, verificationCodeClickedOn: false },
    { verificationCodeClickedOn: true, confirmedDate: new Date() },
  ).lean();

  if (!claimedVerification) {
    return { error: true, message: ApiMessage.EMAIL_ALREADY_CONFIRMED };
  }

  await EmailVerificationModel.updateMany(
    { userId: user._id, verificationCodeClickedOn: false },
    { verificationCodeClickedOn: true },
  );

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { confirmedEmail: true, modifiedDate: new Date() },
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
