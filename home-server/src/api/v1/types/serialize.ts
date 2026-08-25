import { Types } from "mongoose";
import {
  Notification,
  NotificationFields,
  UserNoPassword,
  UserFields,
} from "@home/shared";

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
