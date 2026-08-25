import { Types } from "mongoose";
import { NotificationFields, UserFields } from "@home/shared";

export interface User extends UserFields<Types.ObjectId, Date> {
  password: string;
}

export type NotificationDocument = NotificationFields<Types.ObjectId, Date>;
