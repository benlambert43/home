import { Types } from "mongoose";
import {
  RequestPasswordResetRequestBody,
  RequestPasswordResetResponse,
} from "@home/shared";
import { PasswordResetModel } from "../../model/passwordResetModel";
import { UserModel } from "../../model/userModel";
import { handleSendPasswordReset } from "../../email/handleSendPasswordReset";
import { ApiMessage } from "../../http/messages";

const sent: RequestPasswordResetResponse = {
  error: false,
  message: ApiMessage.PASSWORD_RESET_LINK_SENT,
};

const hasUnusedResetLink = async (userId: Types.ObjectId) =>
  (await PasswordResetModel.exists({
    userId,
    resetCodeUsed: false,
    expiresDate: { $gt: new Date() },
  })) !== null;

export const handleRequestPasswordReset = async ({
  email,
}: Pick<
  RequestPasswordResetRequestBody,
  "email"
>): Promise<RequestPasswordResetResponse> => {
  const foundUser = await UserModel.findOne({ email });

  if (!foundUser || foundUser.userBanned) return sent;

  if (await hasUnusedResetLink(foundUser._id)) return sent;

  handleSendPasswordReset(foundUser).catch((e: unknown) => {
    console.error("Failed to send password reset email:", e);
  });

  return sent;
};
