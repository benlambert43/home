import * as bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { User, UserNoPassword } from "../../types/types";
import { generateUsername } from "unique-username-generator";

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

const handleCreateUser = async (validCreateAccountRequestBody: {
  firstname: string;
  lastname: string;
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

  const { firstname, lastname, email } = validCreateAccountRequestBody;
  const username = generateUsername("-", 3);

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
  email: string;
  password: string;
}) => {
  const newUser = await handleCreateUser(validCreateAccountRequestBody);
  const newJwt = createApiToken(newUser);

  return { token: newJwt, user: newUser };
};
