import { EmailVerificationModel } from "../../model/emailVerificationModel";
import { UserModel } from "../../model/userModel";
import { EncodedAccountJwt } from "../../types/types";

export const handleRequestNewEmailVerificationLink = async ({
  decodedToken,
}: {
  decodedToken: EncodedAccountJwt;
}) => {
  const foundUser = await UserModel.findById(decodedToken.user._id);
  if (!foundUser) {
    return { error: true };
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
    return { error: true };
  }

  console.log(foundUser);
  console.log(mostRecentEmailVerification);
  return { error: false };
};
