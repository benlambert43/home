import mongoose, { Schema } from "mongoose";

export const emailVerificationSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  email: { type: String, required: true },
  verificationToken: { type: String, required: true },
  verificationTokenClickedOn: { type: Boolean, required: true },
  error: { type: Boolean, required: true },
  gmailApiResponse: { type: String, required: true },
  createdDate: { type: Date, required: true },
  confirmedDate: { type: Date },
  expiresDate: { type: Date, required: true },
});
