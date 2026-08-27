import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (plaintextPassword: string) =>
  bcrypt.hash(plaintextPassword, await bcrypt.genSalt(SALT_ROUNDS));

export const verifyPassword = async (
  plaintextPassword: string,
  hashedPassword: string,
) => bcrypt.compare(plaintextPassword, hashedPassword);
