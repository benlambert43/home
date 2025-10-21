import * as bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import { UserModel } from "../../model/userModel";
import { createApiToken } from "../../auth/createApiToken";
import { User, UserNoPassword } from "../../types/types";

configDotenv();

const saltPassword = async (plaintextpassword: string) => {
  const salt = await bcrypt.genSalt(5);
  const hash = await bcrypt.hash(plaintextpassword, salt);
  return hash;
};

const shouldCreateAdminAccount = (
  email: string,
  username: string,
  password: string
) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (
    username === ADMIN_USER &&
    password === ADMIN_PASSWORD &&
    email === ADMIN_EMAIL
  ) {
    return true;
  }
  return false;
};

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
    validCreateAccountRequestBody.username,
    validCreateAccountRequestBody.password
  );

  const { firstname, lastname, username, email } =
    validCreateAccountRequestBody;

  const newUser = new UserModel({
    firstname,
    lastname,
    username,
    email,
    password: saltedPassword,
    createdDate: new Date(),
    modifiedDate: new Date(),
    role: isAdmin ? "Admin" : "User",
  });
  const saveNewUser = await newUser.save();
  return saveNewUser as User;
};

export const removePasswordFromUserObject = (user: User | UserNoPassword) => {
  const {
    _id,
    firstname,
    lastname,
    username,
    email,
    createdDate,
    modifiedDate,
    role,
  } = user;
  const userRemovePassword: UserNoPassword = {
    _id,
    firstname,
    lastname,
    username,
    email,
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
