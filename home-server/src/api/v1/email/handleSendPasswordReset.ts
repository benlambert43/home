import dayjs from "dayjs";
import { PasswordResetModel } from "../model/passwordResetModel";
import { UserDocument } from "../types/db";
import { sendMail } from "./mailTransporter";
import { frontendUrl } from "../http/frontendUrl";
import {
  generatePasswordResetCode,
  hashPasswordResetCode,
} from "../auth/passwordResetCode";

export const PASSWORD_RESET_LIFETIME_MINUTES = 15;

const buildPasswordResetLink = (code: string) => {
  const link = frontendUrl("profile/accountManagement/changePassword");
  link.searchParams.set("code", code);
  return link;
};

export const handleSendPasswordReset = async (user: UserDocument) => {
  const resetCode = generatePasswordResetCode();
  const passwordResetLink = buildPasswordResetLink(resetCode);

  const pendingSendPasswordReset = new PasswordResetModel({
    userId: user._id,
    email: user.email,
    resetCodeHash: hashPasswordResetCode(resetCode),
    resetCodeUsed: false,
    error: true,
    pendingSend: true,
    gmailApiResponse: "Pending.",
    createdDate: dayjs(),
    usedDate: undefined,
    expiresDate: dayjs().add(PASSWORD_RESET_LIFETIME_MINUTES, "minute"),
  });
  const pendingSendPasswordResetId = (await pendingSendPasswordReset.save())
    ._id;

  const sendMailRes = await sendMail({
    to: user.email,
    subject: "benlambert dot tech password reset",
    text:
      `Here is your link to choose a new password: \n\n${passwordResetLink.toString()}` +
      `\n\nThe link expires in ${PASSWORD_RESET_LIFETIME_MINUTES} minutes. ` +
      `If you did not ask to reset your password you can ignore this email, your password will not change.`,
  });

  await PasswordResetModel.findByIdAndUpdate(pendingSendPasswordResetId, {
    error: !sendMailRes.ok,
    pendingSend: false,
    gmailApiResponse: sendMailRes.response || "empty gmailApiResponse.",
  });
};
