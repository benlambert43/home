import { JwtPayload } from "jsonwebtoken";
import { removePasswordFromUserObject } from "../../accountManagement/handlers/handleCreateAccount";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import {
  EncodedAccountJwt,
  NewEmailVerification,
  User,
} from "../../types/types";
import { sendMail } from "./mailTransporter";
import { configDotenv } from "dotenv";
import * as jwt from "jsonwebtoken";

configDotenv();

const createEmailVerificationToken = (user: User) => {
  const EMAIL_OUTGOING_JWT_SECRET = process.env.EMAIL_OUTGOING_JWT_SECRET;
  if (
    typeof EMAIL_OUTGOING_JWT_SECRET !== "string" ||
    EMAIL_OUTGOING_JWT_SECRET.length < 1
  ) {
    throw new Error(
      "Could not create token, EMAIL_OUTGOING_JWT_SECRET is not defined."
    );
  }

  const userRemovePassword = removePasswordFromUserObject(user);

  const encodedAccountJwtData: EncodedAccountJwt = {
    usage: "EMAIL",
    user: userRemovePassword,
  };

  const token = jwt.sign(encodedAccountJwtData, EMAIL_OUTGOING_JWT_SECRET, {
    expiresIn: "1h",
  });

  return token;
};

export const handleSendEmailVerification = async (user: User) => {
  const BASE_API_URL = process.env.BASE_API_URL;
  const emailVerificationToken = createEmailVerificationToken(user);
  const tokenObject = jwt.decode(emailVerificationToken) as JwtPayload;
  const exp = tokenObject.exp || 0;
  const expiresAt = new Date(exp * 1000);

  const sendMailRes = await sendMail({
    to: user.email,
    subject: "benlambert dot tech email verification",
    text: `Here is your link to verify your new account: \n\n${
      BASE_API_URL + "accountManagement/verifyEmail/" + emailVerificationToken
    }`,
  });

  const newEmailVerification = new EmailVerificationModel({
    userId: user._id,
    email: user.email,
    verificationToken: emailVerificationToken,
    verificationTokenClickedOn: false,
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
