import { ResetPasswordRequestBody, ResetPasswordResponse } from "@home/shared";
import { findPasswordReset } from "../../auth/findPasswordReset";
import { hashPassword } from "../../auth/password";
import { PasswordResetModel } from "../../model/passwordResetModel";
import { UserModel } from "../../model/userModel";
import { ApiMessage } from "../../http/messages";

export const handleResetPassword = async ({
  code,
  newPassword,
}: ResetPasswordRequestBody): Promise<ResetPasswordResponse> => {
  const found = await findPasswordReset(code);
  if (found.error) return found;

  const { userId } = found.passwordReset;

  const updatedUser = await UserModel.findByIdAndUpdate(userId, {
    password: await hashPassword(newPassword),
    modifiedDate: new Date(),
  });

  if (!updatedUser) {
    return { error: true, message: ApiMessage.PASSWORD_RESET_LINK_INVALID };
  }

  await PasswordResetModel.updateMany(
    { userId, resetCodeUsed: false },
    { resetCodeUsed: true, usedDate: new Date() },
  );

  return { error: false, message: ApiMessage.PASSWORD_CHANGED };
};
