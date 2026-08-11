import { UserNoPassword } from "@home/shared";

export interface UserCookie extends UserNoPassword {
  loginAt: string;
  issuedAt: string;
  expiresAt: string;
}
