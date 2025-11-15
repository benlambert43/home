import dayjs from "dayjs";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { NewEmailVerification, User } from "../../types/types";
import { sendMail } from "./mailTransporter";
import { configDotenv } from "dotenv";

configDotenv();

export const handleSendEmailVerification = async (user: User) => {
  const BASE_API_URL = process.env.BASE_API_URL;
  const emailVerificationCode = "12345678";
  const expiresAt = dayjs().add(10, "minute");

  const sendMailRes = await sendMail({
    to: user.email,
    subject: "benlambert dot tech email verification",
    text: `Here is your link to verify your new account: \n\n${
      BASE_API_URL + "accountManagement/verifyEmail/" + emailVerificationCode
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
    createdDate: new Date(),
    confirmedDate: undefined,
    expiresDate: expiresAt,
  });
  const saveNewEmailVerification = await newEmailVerification.save();
  return saveNewEmailVerification as NewEmailVerification;
};
