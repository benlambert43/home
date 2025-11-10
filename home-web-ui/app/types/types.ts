import { Types } from "mongoose";

export interface UserNoPassword {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  confirmedEmail: boolean;
  userBanned: boolean;
  createdDate: Date;
  modifiedDate: Date;
  role: "user" | "admin";
}

export interface User extends UserNoPassword {
  password: string;
}

export interface UserCookie extends UserNoPassword {
  loginAt: Date;
  issuedAt: Date;
  expiresAt: Date;
}

export type EncodedAccountJwt = {
  usage: "BFF" | "API" | "EMAIL";
  user: UserNoPassword;
};
