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

export interface StoredPostFile {
  name: string;
  file: string;
  contentType: string;
  byteSize: number;
}

export interface StoredPostRevision<Timestamp = Date> {
  fingerprint: string;
  createdDate: Timestamp;
  content: StoredPostFile;
  headerImage?: StoredPostFile;
  inlineImages: StoredPostFile[];
}

export interface StoredPost<Id = Types.ObjectId, Timestamp = Date> {
  _id: Id;
  title: string;
  fingerprint: string;
  authorUserId: Id;
  createdDate: Timestamp;
  modifiedDate: Timestamp;
  revisions: StoredPostRevision<Timestamp>[];
}

export type PostDocument = StoredPost;

export const latestRevision = <Revision>(
  revisions: Revision[],
): Revision | undefined => revisions[revisions.length - 1];
