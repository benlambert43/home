import { createApiToken } from "../../auth/createApiToken";
import { UserModel } from "../../model/userModel";
import { ChangeUsernameResponse, EncodedAccountJwt } from "@home/shared";
import { serializeUser } from "../../types/serialize";

export const checkUniqueUsername = async (newUsername: string) => {
  const existingEmail = await UserModel.find({ username: newUsername });
  if (existingEmail.length === 0) {
    return true;
  }
  return false;
};

export const handleChangeUsername = async (
  decodedToken: EncodedAccountJwt,
  newUsername: string,
): Promise<ChangeUsernameResponse> => {
  await UserModel.findByIdAndUpdate(decodedToken.user._id, {
    username: newUsername,
    modifiedDate: new Date(),
  });
  const updatedUser = await UserModel.findById(decodedToken.user._id);
  if (!updatedUser) {
    throw new Error(`Updated user with id ${decodedToken.user._id} not found.`);
  }

  const jwt = createApiToken(updatedUser);
  const userNoPassword = serializeUser(updatedUser);

  return { error: false, message: "", jwt: jwt, user: userNoPassword };
};
