export interface Notification {
  _id: string;
  recipientUserId: string;
  subtype: string;
  message: string;
  referenceLink: string;
  markedAsRead: boolean;
  canBeMarkedAsRead: boolean;
  canBeDeleted: boolean;
  timestamp: string;
}
