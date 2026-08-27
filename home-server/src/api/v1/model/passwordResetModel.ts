import mongoose from "mongoose";
import { passwordResetSchema } from "../schema/passwordResetSchema";

export const PasswordResetModel = mongoose.model(
  "passwordReset",
  passwordResetSchema,
);
