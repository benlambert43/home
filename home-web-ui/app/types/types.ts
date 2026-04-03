import { Types } from "mongoose";

export interface UserNoPassword {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  confirmedEmail: boolean;
  userBanned: boolean;
  createdDate: Date;
  modifiedDate: Date;
  role: "user" | "admin";
}

export interface NewEmailVerification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  email: string;
  verificationCode: string;
  verificationCodeClickedOn: Boolean;
  error: Boolean;
  pendingSend: Boolean;
  gmailApiResponse: string;
  createdDate: Date;
  confirmedDate?: Date;
  expiresDate: Date;
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
  usage: "BFF" | "API";
  user: UserNoPassword;
};

export type Notification = {
  _id: Types.ObjectId;
  recipientUserId: Types.ObjectId;
  subtype: string;
  message: string;
  referenceLink: string;
  markedAsRead: boolean;
  canBeMarkedAsRead: boolean;
  canBeDeleted: boolean;
  timestamp: Date;
};
