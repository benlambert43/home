import { Types } from "mongoose";
import { Notification, UserNoPassword, UserRole } from "@home/shared";

type MaybeId = Types.ObjectId | string;
type MaybeDate = Date | string;

const toId = (value: MaybeId): string => value.toString();

const toIsoDate = (value: MaybeDate): string =>
  typeof value === "string" ? value : value.toISOString();

export interface SerializableUser {
  _id: MaybeId;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  confirmedEmail: boolean;
  userBanned: boolean;
  createdDate: MaybeDate;
  modifiedDate: MaybeDate;
  role: UserRole;
}

export interface SerializableNotification {
  _id: MaybeId;
  recipientUserId: MaybeId;
  subtype: string;
  message: string;
  referenceLink: string;
  markedAsRead: boolean;
  canBeMarkedAsRead: boolean;
  canBeDeleted: boolean;
  timestamp: MaybeDate;
}

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
