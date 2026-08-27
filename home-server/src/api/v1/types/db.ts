import { HydratedDocument, InferSchemaType, Types } from "mongoose";
import { NotificationFields, UserFields } from "@home/shared";
import { passwordResetSchema } from "../schema/passwordResetSchema";

export interface UserDocument extends UserFields<Types.ObjectId, Date> {
  password: string;
}

export type NotificationDocument = NotificationFields<Types.ObjectId, Date>;

export type PasswordResetDocument = HydratedDocument<
  InferSchemaType<typeof passwordResetSchema>
>;
