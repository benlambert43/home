import {
  ChangeEmailConsentRequestBody,
  ChangeEmailConsentResponse,
  EncodedAccountJwt,
} from "@home/shared";
import { createApiToken } from "../../auth/createApiToken";
import { UserModel } from "../../model/userModel";
import { serializeUser } from "../../types/serialize";
import { ApiMessage } from "../../http/messages";

export const handleChangeEmailConsent = async (
  decodedToken: EncodedAccountJwt,
  { newsletterConsent, marketingConsent }: ChangeEmailConsentRequestBody,
): Promise<ChangeEmailConsentResponse> => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    decodedToken.user._id,
    { newsletterConsent, marketingConsent, modifiedDate: new Date() },
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
