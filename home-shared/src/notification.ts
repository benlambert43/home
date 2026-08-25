export interface NotificationFields<Id = string, Timestamp = string> {
  _id: Id;
  recipientUserId: Id;
  subtype: string;
  message: string;
  referenceLink: string;
  markedAsRead: boolean;
  canBeMarkedAsRead: boolean;
  canBeDeleted: boolean;
  timestamp: Timestamp;
}

export type Notification = NotificationFields;
