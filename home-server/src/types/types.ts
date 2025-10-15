import { Types } from "mongoose";

export interface UserNoPassword {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  createdDate: Date;
  modifiedDate: Date;
  role: "User" | "Admin";
}

export interface User extends UserNoPassword {
  password: string;
}

export interface UserCookie extends UserNoPassword {
  loginAt: Date;
  issuedAt: Date;
  expiresAt: Date;
}
