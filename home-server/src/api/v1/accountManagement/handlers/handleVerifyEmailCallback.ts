import { Types } from "mongoose";
import { VerifyEmailResponse } from "@home/shared";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { serializeUser } from "../../types/serialize";
import { removeNotification } from "../../notification/handlers/removeNotification";

const updateEmailVerificationStatusToTrue = async ({
  userId,
  emailVerificationId,
}: {
  userId: Types.ObjectId;
  emailVerificationId: Types.ObjectId;
}) => {
  await UserModel.findByIdAndUpdate(userId, { confirmedEmail: true });
  await EmailVerificationModel.findByIdAndUpdate(emailVerificationId, {
    verificationCodeClickedOn: true,
  });
  const user = await UserModel.findById(userId).lean();
  if (user) {
    return user;
  }
  return undefined;
};

export const handleVerifyEmailCallback = async ({
  username,
  email,
  code,
}: {
  username: string;
  email: string;
  code: string;
}): Promise<VerifyEmailResponse> => {
  const user = await UserModel.findOne({
    username: username,
    email: email,
  }).lean();
  const emailVerification = await EmailVerificationModel.findOne({
    email: email,
    verificationCode: code,
  }).lean();
  const userId = user?._id;
  const emailVerificationId = emailVerification?._id;

  if (
    userId &&
    emailVerificationId &&
    user.confirmedEmail === true &&
    emailVerification.verificationCodeClickedOn === true
  ) {
    return {
      error: true,
      message: "You have already confirmed your email address.",
    };
  }

  const expired = Boolean(
    emailVerification &&
    emailVerification?.expiresDate.getTime() <= new Date().getTime(),
  );

  if (expired) {
    return {
      error: true,
      message:
        "Email verification link has expired. Please request a new email verification link.",
    };
  }

  if (
    userId &&
    emailVerificationId &&
    !expired &&
    emailVerification.verificationCode === code
  ) {
    const updatedUser = await updateEmailVerificationStatusToTrue({
      userId,
      emailVerificationId,
    });
    if (!updatedUser) {
      return {
        error: true,
        message: "Unable to find updated user.",
      };
    }

    const jwt = createApiToken(updatedUser);
    await removeNotification({
      recipientUserId: updatedUser._id,
      subtype: "confirmEmail",
    });

    return {
      error: false,
      message:
        "Thank you for confirming your email address! You can now close this window.",
      jwt: jwt,
      user: serializeUser(updatedUser),
    };
  } else {
    return {
      error: true,
      message:
        "Unable to update email verification status. Please request a new email verification link or try again.",
    };
  }
};
