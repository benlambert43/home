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
