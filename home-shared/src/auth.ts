import { UserNoPassword } from "./user";

export type JwtUsage = "BFF" | "API";

export type EncodedAccountJwt = {
  usage: JwtUsage;
  user: UserNoPassword;
};
