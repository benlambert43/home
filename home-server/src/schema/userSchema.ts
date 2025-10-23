import mongoose from "mongoose";

export const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  confirmedEmail: { type: Boolean, required: true },
  userBanned: { type: Boolean, required: true },
  password: { type: String, required: true },
  createdDate: Date,
  modifiedDate: Date,
  role: { type: String, enum: ["user", "admin"] },
});
