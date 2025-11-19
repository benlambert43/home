import * as bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { User, UserNoPassword } from "../../types/types";
import { generateUsername } from "unique-username-generator";
import { handleVerifyCaptcha } from "../../auth/verifyCaptcha";

configDotenv();

const saltPassword = async (plaintextpassword: string) => {
  const salt = await bcrypt.genSalt(5);
  const hash = await bcrypt.hash(plaintextpassword, salt);
  return hash;
};

const shouldCreateAdminAccount = (email: string, password: string) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (password === ADMIN_PASSWORD && email === ADMIN_EMAIL) {
    return true;
  }
  return false;
};

export const createNewUniqueRandomUsername = async (inc?: number) => {
  if (inc && inc >= 10) {
    return undefined;
  }

  const newUsername = generateUsername("-", 4);
  const existingUsername = await UserModel.find({ username: newUsername });

  if (existingUsername.length === 0) {
    return newUsername;
  } else {
    const initInc = inc ? inc : 0;
    const addInc = initInc + 1;
    createNewUniqueRandomUsername(addInc);
  }
};

export const checkUniqueEmail = async (email: string) => {
  const existingEmail = await UserModel.find({ email: email });
  if (existingEmail.length === 0) {
    return true;
  }
  return false;
};

export const verifyCaptcha = async (grecaptcharesponse: string) =>
  await handleVerifyCaptcha(grecaptcharesponse);

const handleCreateUser = async (validCreateAccountRequestBody: {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}) => {
  const saltedPassword = await saltPassword(
    validCreateAccountRequestBody.password
  );
  const isAdmin = shouldCreateAdminAccount(
    validCreateAccountRequestBody.email,
    validCreateAccountRequestBody.password
  );

  const { firstname, lastname, username, email } =
    validCreateAccountRequestBody;

  const newUser = new UserModel({
    firstname,
    lastname,
    email,
    username,
    confirmedEmail: false,
    userBanned: false,
    password: saltedPassword,
    createdDate: new Date(),
    modifiedDate: new Date(),
    role: isAdmin ? "admin" : "user",
  });
  const saveNewUser = await newUser.save();
  return saveNewUser as User;
};

export const removePasswordFromUserObject = (user: User | UserNoPassword) => {
  const {
    _id,
    firstname,
    lastname,
    email,
    username,
    confirmedEmail,
    userBanned,
    createdDate,
    modifiedDate,
    role,
  } = user;
  const userRemovePassword: UserNoPassword = {
    _id,
    firstname,
    lastname,
    email,
    username,
    confirmedEmail,
    userBanned,
    createdDate,
    modifiedDate,
    role,
  };
  return userRemovePassword;
};

export const handleCreateAccount = async (validCreateAccountRequestBody: {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}) => {
  const newUser = await handleCreateUser(validCreateAccountRequestBody);
  const newJwt = createApiToken(newUser);

  return { token: newJwt, user: newUser };
};
