import { Types } from "mongoose";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";

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
  const expired = Boolean(
    emailVerification &&
      emailVerification?.expiresDate.getTime() <= new Date().getTime()
  );

  if (
    userId &&
    emailVerificationId &&
    !expired &&
    emailVerification.verificationCode === code
  ) {
    await updateEmailVerificationStatusToTrue({ userId, emailVerificationId });
    return 0;
  } else {
    throw new Error("Unable to update email verification.");
  }
};
