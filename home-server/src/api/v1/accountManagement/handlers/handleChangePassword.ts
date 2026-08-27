import {
  ChangePasswordRequestBody,
  ChangePasswordResponse,
  EncodedAccountJwt,
} from "@home/shared";
import { createApiToken } from "../../auth/createApiToken";
import { hashPassword, verifyPassword } from "../../auth/password";
import { UserModel } from "../../model/userModel";
import { serializeUser } from "../../types/serialize";
import { ApiMessage } from "../../http/messages";

export const handleChangePassword = async (
  decodedToken: EncodedAccountJwt,
  { currentPassword, newPassword }: ChangePasswordRequestBody,
): Promise<ChangePasswordResponse> => {
  const foundUser = await UserModel.findById(decodedToken.user._id);

  if (!foundUser) {
    return { error: true, message: ApiMessage.UNEXPECTED };
  }

  if (!(await verifyPassword(currentPassword, foundUser.password))) {
    return { error: true, message: ApiMessage.CURRENT_PASSWORD_INCORRECT };
  }

  if (await verifyPassword(newPassword, foundUser.password)) {
    return { error: true, message: ApiMessage.NEW_PASSWORD_MUST_DIFFER };
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    foundUser._id,
    { password: await hashPassword(newPassword), modifiedDate: new Date() },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    return { error: true, message: ApiMessage.UNEXPECTED };
  }

  return {
    error: false,
    message: ApiMessage.PASSWORD_CHANGED,
    jwt: createApiToken(updatedUser),
    user: serializeUser(updatedUser),
  };
};
