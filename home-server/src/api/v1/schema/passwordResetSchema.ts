import mongoose, { Schema } from "mongoose";

export const passwordResetSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  email: { type: String, required: true },
  resetCodeHash: { type: String, required: true },
  resetCodeUsed: { type: Boolean, required: true },
  error: { type: Boolean, required: true },
  pendingSend: { type: Boolean, required: true },
  gmailApiResponse: { type: String, required: true },
  createdDate: { type: Date, required: true },
  usedDate: { type: Date },
  expiresDate: { type: Date, required: true },
});
