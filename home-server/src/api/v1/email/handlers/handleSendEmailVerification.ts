import dayjs from "dayjs";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { User } from "../../types/db";
import { sendMail } from "./mailTransporter";
import { encodeUrlSafeB64 } from "./encodeUrlSafeB64";
import { frontendUrl } from "../../http/frontendUrl";

const PIN_RANGE = 1000000;
const PIN_CEILING = Math.floor(2 ** 32 / PIN_RANGE) * PIN_RANGE;

const generateSecurePIN = () => {
  const randomValues = new Uint32Array(1);

  do {
    crypto.getRandomValues(randomValues);
  } while (randomValues[0] >= PIN_CEILING);

  return (randomValues[0] % PIN_RANGE).toString().padStart(6, "0");
};

export const handleSendEmailVerification = async (user: User) => {
  const emailVerificationCode = generateSecurePIN();
  const verificationLink = frontendUrl("profile/accountManagement/verifyEmail");
  verificationLink.searchParams.set(
    "username",
    encodeUrlSafeB64(user.username),
  );
  verificationLink.searchParams.set("email", encodeUrlSafeB64(user.email));
  verificationLink.searchParams.set("code", emailVerificationCode);

  const pendingSendEmailVerification = new EmailVerificationModel({
    userId: user._id,
    email: user.email,
    verificationCode: emailVerificationCode,
    verificationCodeClickedOn: false,
    error: true,
    pendingSend: true,
    gmailApiResponse: "Pending.",
    createdDate: dayjs(),
    confirmedDate: undefined,
    expiresDate: dayjs().add(10, "minute"),
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
      error: sendMailRes.code !== 0,
      pendingSend: false,
      gmailApiResponse:
        JSON.stringify(sendMailRes.response) || "empty gmailApiResponse.",
    },
  );
};
