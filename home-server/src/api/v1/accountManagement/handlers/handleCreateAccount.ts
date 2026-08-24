import * as bcrypt from "bcrypt";
import { generateUsername } from "unique-username-generator";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { User } from "../../types/db";
import { checkUniqueUsername } from "../../user/userQueries";

const MAX_USERNAME_ATTEMPTS = 10;

interface NewAccount {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}

const saltPassword = async (plaintextpassword: string) =>
  bcrypt.hash(plaintextpassword, await bcrypt.genSalt(5));

const shouldCreateAdminAccount = (email: string, password: string) =>
  email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;

export const createNewUniqueRandomUsername = async () => {
  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt++) {
    const newUsername = generateUsername("-", 4);
    if (await checkUniqueUsername(newUsername)) {
      return newUsername;
    }
  }
  return undefined;
};

const handleCreateUser = async ({
  firstname,
  lastname,
  username,
  email,
  password,
}: NewAccount) => {
  const newUser = new UserModel({
    firstname,
    lastname,
    email,
    username,
    confirmedEmail: false,
    userBanned: false,
    password: await saltPassword(password),
    createdDate: new Date(),
    modifiedDate: new Date(),
    role: shouldCreateAdminAccount(email, password) ? "admin" : "user",
  });

  return (await newUser.save()) as User;
};

export const handleCreateAccount = async (newAccount: NewAccount) => {
  const newUser = await handleCreateUser(newAccount);

  return { token: createApiToken(newUser), user: newUser };
};
