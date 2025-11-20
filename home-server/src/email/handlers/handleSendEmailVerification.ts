import dayjs from "dayjs";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { NewEmailVerification, User } from "../../types/types";
import { sendMail } from "./mailTransporter";
import { encodeUrlSafeB64 } from "./encodeUrlSafeB64";

const generateSecurePIN = () => {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  const pin = (randomValues[0] % 1000000).toString().padStart(6, "0");
  return pin;
};

export const handleSendEmailVerification = async (user: User) => {
  const BASE_API_URL = process.env.BASE_API_URL;
  const emailVerificationCode = generateSecurePIN().toString();
  const encodedUsername = encodeUrlSafeB64(user.username);
  const encodedEmail = encodeUrlSafeB64(user.email);
  const createdDate = dayjs();
  const expiresAt = dayjs().add(10, "minute");

  const sendMailRes = await sendMail({
    to: user.email,
    subject: "benlambert dot tech email verification",
    text: `Here is your link to verify your new account: \n\n${
      BASE_API_URL +
      "accountManagement/verifyEmail/" +
      encodedUsername +
      "/" +
      encodedEmail +
      "/" +
      emailVerificationCode
    }`,
  });

  const newEmailVerification = new EmailVerificationModel({
    userId: user._id,
    email: user.email,
    verificationCode: emailVerificationCode,
    verificationCodeClickedOn: false,
    error: sendMailRes.code === 0 ? false : true,
    gmailApiResponse:
      JSON.stringify(sendMailRes?.response) || "empty gmailApiResponse.",
    createdDate: createdDate,
    confirmedDate: undefined,
    expiresDate: expiresAt,
  });
  const saveNewEmailVerification = await newEmailVerification.save();
  return saveNewEmailVerification as NewEmailVerification;
};
