import { UserModel } from "../model/userModel";

export const checkUniqueEmail = async (email: string) =>
  (await UserModel.exists({ email })) === null;

export const checkUniqueUsername = async (username: string) =>
  (await UserModel.exists({ username })) === null;
