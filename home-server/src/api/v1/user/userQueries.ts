import { UserModel } from "../model/userModel";

export const checkUniqueEmail = async (email: string) =>
  (await UserModel.exists({ email })) === null;

export const checkUniqueUsername = async (
  username: string,
  ownUserId?: string,
) => {
  const existingUser = await UserModel.exists({ username });
  return existingUser === null || existingUser._id.equals(ownUserId);
};
