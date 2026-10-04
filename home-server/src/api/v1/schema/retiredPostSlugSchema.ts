import mongoose from "mongoose";

export const retiredPostSlugSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  retiredDate: { type: Date, required: true },
});
