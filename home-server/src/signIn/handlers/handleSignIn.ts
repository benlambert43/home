import * as bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import { User } from "../../types/types";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";

configDotenv();

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
    throw new Error("User with this email does not exist.");
  }

  const validLogin = await authenticateLogin(
    validSignInRequestBody.password,
    findUserByEmail.password
  );
  if (!validLogin) {
    throw new Error("Password is not correct.");
  }

  const newJwt = createApiToken(findUserByEmail);

  return { token: newJwt, user: findUserByEmail };
};
