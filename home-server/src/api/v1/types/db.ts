import { Types } from "mongoose";
import { UserRole } from "@home/shared";

export interface UserNoPasswordDocument {
  _id: Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  confirmedEmail: boolean;
  userBanned: boolean;
  createdDate: Date;
  modifiedDate: Date;
  role: UserRole;
}

export interface User extends UserNoPasswordDocument {
  password: string;
}

export interface NotificationDocument {
  _id: Types.ObjectId;
  recipientUserId: Types.ObjectId;
  subtype: string;
  message: string;
  referenceLink: string;
  markedAsRead: boolean;
  canBeMarkedAsRead: boolean;
  canBeDeleted: boolean;
  timestamp: Date;
}

export interface NewEmailVerification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  email: string;
  verificationCode: string;
  verificationCodeClickedOn: boolean;
  error: boolean;
  pendingSend: boolean;
  gmailApiResponse: string;
  createdDate: Date;
  confirmedDate?: Date;
  expiresDate: Date;
}
