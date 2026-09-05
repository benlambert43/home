import { Types } from "mongoose";
import {
  Notification,
  NotificationFields,
  Post,
  postHeaderImagePath,
  PostImage,
  postInlineImagePath,
  postInlineImageReference,
  PostSummary,
  UserNoPassword,
  UserFields,
} from "@home/shared";
import { requireLatestRevision, StoredPost, StoredPostFile } from "./db";

type MaybeId = Types.ObjectId | string;
type MaybeDate = Date | string;

const toId = (value: MaybeId): string => value.toString();

const toIsoDate = (value: MaybeDate): string =>
  typeof value === "string" ? value : value.toISOString();

export type SerializableUser = UserFields<MaybeId, MaybeDate>;

export type SerializableNotification = NotificationFields<MaybeId, MaybeDate>;

export const serializeUser = (user: SerializableUser): UserNoPassword => ({
  _id: toId(user._id),
  firstname: user.firstname,
  lastname: user.lastname,
  email: user.email,
  username: user.username,
  confirmedEmail: user.confirmedEmail,
  userBanned: user.userBanned,
  createdDate: toIsoDate(user.createdDate),
  modifiedDate: toIsoDate(user.modifiedDate),
  role: user.role,
});

export const serializeNotification = (
  notification: SerializableNotification,
): Notification => ({
  _id: toId(notification._id),
  recipientUserId: toId(notification.recipientUserId),
  subtype: notification.subtype,
  message: notification.message,
  referenceLink: notification.referenceLink,
  markedAsRead: notification.markedAsRead,
  canBeMarkedAsRead: notification.canBeMarkedAsRead,
  canBeDeleted: notification.canBeDeleted,
  timestamp: toIsoDate(notification.timestamp),
});

type SerializablePost = StoredPost<MaybeId, MaybeDate>;

const serializePostImage = (path: string, file: StoredPostFile): PostImage => ({
  name: file.name,
  contentType: file.contentType,
  byteSize: file.byteSize,
  path,
});

export const serializePostSummary = (
  post: SerializablePost,
  authorUsername: string | null,
): PostSummary => {
  const _id = toId(post._id);
  const revision = requireLatestRevision(post);

  return {
    _id,
    title: post.title,
    authorUserId: toId(post.authorUserId),
    authorUsername,
    createdDate: toIsoDate(post.createdDate),
    modifiedDate: toIsoDate(post.modifiedDate),
    revision: revision.fingerprint,
    headerImage: revision.headerImage
      ? serializePostImage(postHeaderImagePath(_id), revision.headerImage)
      : null,
  };
};

export const serializePost = (
  post: SerializablePost,
  authorUsername: string | null,
  content: string,
): Post => {
  const summary = serializePostSummary(post, authorUsername);

  return {
    ...summary,
    content,
    inlineImages: requireLatestRevision(post).inlineImages.map((image) => ({
      ...serializePostImage(
        postInlineImagePath(summary._id, image.name),
        image,
      ),
      reference: postInlineImageReference(image.name),
    })),
  };
};
