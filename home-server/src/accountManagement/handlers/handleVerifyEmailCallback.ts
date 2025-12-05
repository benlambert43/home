import { Types } from "mongoose";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { removePasswordFromUserObject } from "./handleCreateAccount";

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
}) => {
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
      errorMessage: "You have already confirmed your email address.",
    };
  }

  const expired = Boolean(
    emailVerification &&
      emailVerification?.expiresDate.getTime() <= new Date().getTime()
  );

  if (expired) {
    return {
      error: true,
      errorMessage:
        "Email verification link has expired. Please request a new link.",
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
        errorMessage: "Unable to find updated user.",
      };
    }

    const updatedToken = createApiToken(updatedUser);

    return {
      error: false,
      errorMessage: "",
      newToken: updatedToken,
      userNoPassword: removePasswordFromUserObject(updatedUser),
    };
  } else {
    return {
      error: true,
      errorMessage:
        "Unable to update email verification status. Please request a new link or try again.",
    };
  }
};
