import mongoose from "mongoose";
import { signInAttemptSchema } from "../schema/signInAttemptSchema";

export const SignInAttemptModel = mongoose.model(
  "signInAttempt",
  signInAttemptSchema,
);
