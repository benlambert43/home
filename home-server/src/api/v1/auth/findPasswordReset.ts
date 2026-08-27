import { PasswordResetModel } from "../model/passwordResetModel";
import { PasswordResetDocument } from "../types/db";
import { ApiMessage } from "../http/messages";
import { hashPasswordResetCode } from "./passwordResetCode";

type FoundPasswordReset =
  | { error: true; message: string }
  | { error: false; passwordReset: PasswordResetDocument };

export const findPasswordReset = async (
  code: string,
): Promise<FoundPasswordReset> => {
  const passwordReset = await PasswordResetModel.findOne({
    resetCodeHash: hashPasswordResetCode(code),
  });

  if (!passwordReset || passwordReset.resetCodeUsed) {
    return { error: true, message: ApiMessage.PASSWORD_RESET_LINK_INVALID };
  }

  if (passwordReset.expiresDate.getTime() <= Date.now()) {
    return { error: true, message: ApiMessage.PASSWORD_RESET_LINK_EXPIRED };
  }

  return { error: false, passwordReset };
};
