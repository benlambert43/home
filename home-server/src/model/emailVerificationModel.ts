import mongoose from "mongoose";
import { emailVerificationSchema } from "../schema/emailVerificationSchema";

export const EmailVerificationModel = mongoose.model(
  "emailVerification",
  emailVerificationSchema
);
