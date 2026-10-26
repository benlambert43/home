import mongoose, { Schema } from "mongoose";

export const savedNameSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  key: { type: String, required: true },
  parts: { type: [String], required: true },
  number: { type: Number, required: true },
  savedDate: { type: Date, required: true },
});

savedNameSchema.index({ userId: 1, key: 1 }, { unique: true });
savedNameSchema.index({ userId: 1, _id: 1 });
