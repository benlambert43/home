import { ChangeUsernameResponse, EncodedAccountJwt } from "@home/shared";
import { createApiToken } from "../../auth/createApiToken";
import { UserModel } from "../../model/userModel";
import { serializeUser } from "../../types/serialize";
import { ApiMessage } from "../../http/messages";

export const handleChangeUsername = async (
  decodedToken: EncodedAccountJwt,
  newUsername: string,
): Promise<ChangeUsernameResponse> => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    decodedToken.user._id,
    { username: newUsername, modifiedDate: new Date() },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new Error(`Updated user with id ${decodedToken.user._id} not found.`);
  }

  return {
    error: false,
    message: ApiMessage.USERNAME_CHANGED,
    jwt: createApiToken(updatedUser),
    user: serializeUser(updatedUser),
  };
};
