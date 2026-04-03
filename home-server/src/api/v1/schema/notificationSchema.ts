import mongoose, { Schema } from "mongoose";

export const notificationSchema = new mongoose.Schema({
  recipientUserId: { type: Schema.Types.ObjectId, required: true },
  subtype: { type: String, required: true },
  message: { type: String, required: true },
  referenceLink: { type: String, required: true },
  markedAsRead: { type: Boolean, required: true },
  canBeMarkedAsRead: { type: Boolean, required: true },
  canBeDeleted: { type: Boolean, required: true },
  timestamp: { type: Date, required: true },
});
