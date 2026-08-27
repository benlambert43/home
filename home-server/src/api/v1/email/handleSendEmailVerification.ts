import dayjs from "dayjs";
import { EmailVerificationModel } from "../model/emailVerificationModel";
import { UserDocument } from "../types/db";
import { sendMail } from "./mailTransporter";
import { encodeUrlSafeB64 } from "../http/urlSafeB64";
import { frontendUrl } from "../http/frontendUrl";
import { generateEmailedCode, hashEmailedCode } from "../auth/emailedCode";

const LINK_LIFETIME_MINUTES = 10;

const buildVerificationLink = (user: UserDocument, code: string) => {
  const link = frontendUrl("profile/accountManagement/verifyEmail");
  link.searchParams.set("username", encodeUrlSafeB64(user.username));
  link.searchParams.set("email", encodeUrlSafeB64(user.email));
  link.searchParams.set("code", code);
  return link;
};

export const handleSendEmailVerification = async (user: UserDocument) => {
  const emailVerificationCode = generateEmailedCode();
  const verificationLink = buildVerificationLink(user, emailVerificationCode);

  const pendingSendEmailVerification = new EmailVerificationModel({
    userId: user._id,
    email: user.email,
    verificationCodeHash: hashEmailedCode(emailVerificationCode),
    verificationCodeClickedOn: false,
    error: true,
    pendingSend: true,
    gmailApiResponse: "Pending.",
    createdDate: dayjs(),
    confirmedDate: undefined,
    expiresDate: dayjs().add(LINK_LIFETIME_MINUTES, "minute"),
  });
  const pendingSendEmailVerificationId = (
    await pendingSendEmailVerification.save()
  )._id;

  const sendMailRes = await sendMail({
    to: user.email,
    subject: "benlambert dot tech email verification",
    text: `Here is your link to verify your new account: \n\n${verificationLink.toString()}`,
  });

  await EmailVerificationModel.findByIdAndUpdate(
    pendingSendEmailVerificationId,
    {
      error: !sendMailRes.ok,
      pendingSend: false,
      gmailApiResponse: sendMailRes.response || "empty gmailApiResponse.",
    },
  );
};
