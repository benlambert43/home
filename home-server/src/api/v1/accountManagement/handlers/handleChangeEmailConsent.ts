import {
  ChangeEmailConsentRequestBody,
  ChangeEmailConsentResponse,
  Consent,
  EncodedAccountJwt,
} from "@home/shared";
import { createApiToken } from "../../auth/createApiToken";
import { UserModel } from "../../model/userModel";
import { serializeUser } from "../../types/serialize";
import { ApiMessage } from "../../http/messages";

const answerConsent = (
  saved: Consent<Date>,
  agreed: boolean,
  timestamp: Date,
): Consent<Date> => (saved.agreed === agreed ? saved : { agreed, timestamp });

export const handleChangeEmailConsent = async (
  decodedToken: EncodedAccountJwt,
  { newsletterConsent, marketingConsent }: ChangeEmailConsentRequestBody,
): Promise<ChangeEmailConsentResponse> => {
  const foundUser = await UserModel.findById(decodedToken.user._id).lean();

  if (!foundUser) {
    throw new Error(`User with id ${decodedToken.user._id} not found.`);
  }

  const now = new Date();

  const updatedUser = await UserModel.findByIdAndUpdate(
    foundUser._id,
    {
      newsletterConsent: answerConsent(
        foundUser.newsletterConsent,
        newsletterConsent,
        now,
      ),
      marketingConsent: answerConsent(
        foundUser.marketingConsent,
        marketingConsent,
        now,
      ),
      modifiedDate: now,
    },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new Error(`Updated user with id ${decodedToken.user._id} not found.`);
  }

  return {
    error: false,
    message: ApiMessage.EMAIL_CONSENT_CHANGED,
    jwt: createApiToken(updatedUser),
    user: serializeUser(updatedUser),
  };
};
