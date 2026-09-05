import { HydratedDocument, InferSchemaType, Types } from "mongoose";
import { NotificationFields, UserFields } from "@home/shared";
import { ApiError } from "../http/apiError";
import { ApiMessage } from "../http/messages";
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

export const requireLatestRevision = <Timestamp>(post: {
  _id: { toString: () => string };
  revisions: StoredPostRevision<Timestamp>[];
}): StoredPostRevision<Timestamp> => {
  const revision = latestRevision(post.revisions);

  if (!revision) {
    throw new ApiError(
      ApiMessage.POST_HAS_NO_REVISION,
      500,
      `Post ${post._id.toString()} has no revision.`,
    );
  }

  return revision;
};
