import dayjs from "dayjs";
import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";
import { EncodedAccountJwt } from "../../types/types";
import { handleSendEmailVerification } from "../../email/handlers/handleSendEmailVerification";

export const handleRequestNewEmailVerificationLink = async ({
  decodedToken,
}: {
  decodedToken: EncodedAccountJwt;
}) => {
  const foundUser = await UserModel.findById(decodedToken.user._id);
  if (!foundUser) {
    return {
      error: true,
      errorMsg: "Unable to find user with provided user id.",
    };
  }

  if (foundUser.confirmedEmail === true) {
    return {
      error: true,
      errorMsg: "You have already confirmed your email address.",
    };
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
    return {
      error: true,
      errorMsg: "Unable to find a record of previous email verification sent.",
    };
  }

  const currentDateTime = dayjs();
  const expiresAtDateTime = dayjs(mostRecentEmailVerification.expiresDate);

  if (currentDateTime.isAfter(expiresAtDateTime)) {
    try {
      await handleSendEmailVerification(foundUser);
      return { error: false, errorMsg: "" };
    } catch {
      return {
        error: true,
        errorMsg:
          "Something went wrong when trying to resend email verification.",
      };
    }
  } else {
    return {
      error: true,
      errorMsg: `
        You already have a pending email verification. 
        Please check your ${foundUser.email} account's spam and junk mail folders. 
        You may send another email at ${expiresAtDateTime}
      `,
    };
  }
};
