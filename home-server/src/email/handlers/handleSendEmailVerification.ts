import { sendMail } from "./mailTransporter";

export const handleSendEmailVerification = async ({
  email,
}: {
  email: string;
}) => {
  const sendMailRes = await sendMail({
    to: email,
    subject: "benlambert dot tech email verification",
    text: `Here is your link to verify your new account: \n\n${"verificationLink"}`,
  });
  return sendMailRes.code;
};
