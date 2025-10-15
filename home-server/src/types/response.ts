import { UserNoPassword } from "./types";

export type CreateAccountResponse = {
  error: boolean;
  message: string;
  jwt?: string;
  user?: UserNoPassword;
};
