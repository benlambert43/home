import { generateUsername } from "unique-username-generator";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { UserDocument } from "../../types/db";
import { checkUniqueUsername } from "../../user/userQueries";
import { usernameHasProfanity } from "../../user/usernameFilter";
import { hashPassword } from "../../auth/password";

const MAX_USERNAME_ATTEMPTS = 10;

interface NewAccount {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}

const shouldCreateAdminAccount = (email: string, password: string) => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  return Boolean(
    ADMIN_EMAIL &&
    ADMIN_PASSWORD &&
    email === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD,
  );
};

export const createNewUniqueRandomUsername = async () => {
  for (let attempt = 0; attempt < MAX_USERNAME_ATTEMPTS; attempt++) {
    const newUsername = generateUsername("-", 4);
    if (usernameHasProfanity(newUsername)) continue;
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
    password: await hashPassword(password),
    createdDate: new Date(),
    modifiedDate: new Date(),
    role: shouldCreateAdminAccount(email, password) ? "admin" : "user",
  });

  return (await newUser.save()) as UserDocument;
};

export const handleCreateAccount = async (newAccount: NewAccount) => {
  const newUser = await handleCreateUser(newAccount);

  return { token: createApiToken(newUser), user: newUser };
};
