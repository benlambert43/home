import * as bcrypt from "bcrypt";
import { configDotenv } from "dotenv";

configDotenv();

const saltPassword = async (plaintextpassword: string) => {
  const salt = await bcrypt.genSalt(5);
  const hash = await bcrypt.hash(plaintextpassword, salt);
  return hash;
};

export const handleCreateAccount = async (validcreateAccountRequestBody: {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
}) => {
  return {};
};
