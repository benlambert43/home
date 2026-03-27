import mongoose, { Schema } from "mongoose";

export const notificationSchema = new mongoose.Schema({
  recipientUserId: { type: Schema.Types.ObjectId, required: true },
  subtype: { type: String, required: true },
  dismissable: { type: Boolean, required: true },
  referenceLink: { type: String, required: true },
  read: { type: Boolean, required: true },
  readable: { type: Boolean, required: true },
});
