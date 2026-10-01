import mongoose from "mongoose";

export const signInAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true },
  attempts: { type: Number, required: true },
  expiresDate: { type: Date, required: true },
});

signInAttemptSchema.index({ email: 1 }, { unique: true });
signInAttemptSchema.index({ expiresDate: 1 }, { expireAfterSeconds: 0 });
