import * as bcrypt from "bcrypt";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";

const authenticateLogin = async (password: string, passwordHash: string) => {
  const hash = passwordHash;
  const result = await bcrypt.compare(password, hash);
  return result;
};

export const handleSignIn = async (validSignInRequestBody: {
  email: string;
  password: string;
}) => {
  const findUserByEmail = await UserModel.findOne({
    email: validSignInRequestBody.email,
  });

  if (!findUserByEmail) {
    throw new Error("Error signing in. Email or password is incorrect.");
  }

  const validLogin = await authenticateLogin(
    validSignInRequestBody.password,
    findUserByEmail.password
  );
  if (!validLogin) {
    throw new Error("Error signing in. Email or password is incorrect.");
  }

  const newJwt = createApiToken(findUserByEmail);

  return { token: newJwt, user: findUserByEmail };
};
