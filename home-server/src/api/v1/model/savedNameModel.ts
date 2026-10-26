import mongoose from "mongoose";
import { savedNameSchema } from "../schema/savedNameSchema";
import { SavedNameDocument } from "../types/db";

export const SavedNameModel = mongoose.model<SavedNameDocument>(
  "savedName",
  savedNameSchema,
);
