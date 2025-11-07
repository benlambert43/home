import { UserNoPassword } from "./types";

export type CreateAccountResponse = {
  error: boolean;
  message: string;
  jwt?: string;
  user?: UserNoPassword;
};

export type SignInResponse = {
  error: boolean;
  message: string;
  jwt?: string;
  user?: UserNoPassword;
};
