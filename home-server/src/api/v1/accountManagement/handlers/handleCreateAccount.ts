import { MAX_USERNAME_CHARACTERS } from "@home/shared";
import { generateUsername } from "unique-username-generator";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { UserDocument } from "../../types/db";
import { checkUniqueUsername } from "../../user/userQueries";
import { rejectDuplicateAccount } from "../../user/rejectDuplicateAccount";
import { usernameHasProfanity } from "../../user/usernameFilter";
import { hashPassword } from "../../auth/password";

const MAX_USERNAME_ATTEMPTS = 10;

interface NewAccount {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  termsConsent: boolean;
  newsletterConsent: boolean;
  marketingConsent: boolean;
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
    if (newUsername.length > MAX_USERNAME_CHARACTERS) continue;
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
  termsConsent,
  newsletterConsent,
  marketingConsent,
}: NewAccount) => {
  const now = new Date();

  const newUser = new UserModel({
    firstname,
    lastname,
    email,
    username,
    confirmedEmail: false,
    userBanned: false,
    password: await hashPassword(password),
    createdDate: now,
    modifiedDate: now,
    role: shouldCreateAdminAccount(email, password) ? "admin" : "user",
    termsConsent: { agreed: termsConsent, timestamp: now },
    newsletterConsent: { agreed: newsletterConsent, timestamp: now },
    marketingConsent: { agreed: marketingConsent, timestamp: now },
  });

  return (await rejectDuplicateAccount(newUser.save())) as UserDocument;
};

export const handleCreateAccount = async (newAccount: NewAccount) => {
  const newUser = await handleCreateUser(newAccount);

  return { token: createApiToken(newUser), user: newUser };
};
