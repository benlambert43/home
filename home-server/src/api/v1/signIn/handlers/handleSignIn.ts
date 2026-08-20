import * as bcrypt from "bcrypt";
import { SignInRequestBody } from "@home/shared";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { ApiMessage } from "../../http/messages";

export const handleSignIn = async ({ email, password }: SignInRequestBody) => {
  const user = await UserModel.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: true as const, message: ApiMessage.INVALID_CREDENTIALS };
  }

  return { error: false as const, token: createApiToken(user), user };
};
