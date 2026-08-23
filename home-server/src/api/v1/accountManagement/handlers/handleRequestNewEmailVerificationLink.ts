import dayjs from "dayjs";
import {
  EncodedAccountJwt,
  RequestNewEmailVerificationLinkResponse,
} from "@home/shared";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";
import { handleSendEmailVerification } from "../../email/handlers/handleSendEmailVerification";
import { ApiMessage, pendingEmailVerification } from "../../http/messages";

export const handleRequestNewEmailVerificationLink = async (
  decodedToken: EncodedAccountJwt,
): Promise<RequestNewEmailVerificationLinkResponse> => {
  const foundUser = await UserModel.findById(decodedToken.user._id);

  if (!foundUser) {
    return { error: true, message: ApiMessage.UNEXPECTED };
  }

  if (foundUser.confirmedEmail === true) {
    return { error: true, message: ApiMessage.EMAIL_ALREADY_CONFIRMED };
  }

  /*
   * chaining .sort() after .findOne():
   * 1) filter all documents matching the query.
   * 2) sort those matching documents by createdDate in descending order (-1)
   * 3) return the first document from the sorted results
   */

  const mostRecentEmailVerification = await EmailVerificationModel.findOne({
    userId: foundUser._id,
  }).sort({ createdDate: -1 });

  if (!mostRecentEmailVerification) {
    return { error: true, message: ApiMessage.UNEXPECTED };
  }

  const expiresAtDateTime = dayjs(mostRecentEmailVerification.expiresDate);

  if (!dayjs().isAfter(expiresAtDateTime)) {
    return {
      error: true,
      message: pendingEmailVerification(
        foundUser.email,
        expiresAtDateTime.format("MMM D, YYYY [at] h:mm A"),
      ),
    };
  }

  handleSendEmailVerification(foundUser).catch((e: unknown) => {
    console.error("Failed to send account verification email:", e);
  });

  return { error: false, message: "" };
};
