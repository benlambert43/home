import mongoose from "mongoose";
import { retiredPostSlugSchema } from "../schema/retiredPostSlugSchema";

export const RetiredPostSlugModel = mongoose.model(
  "retiredPostSlug",
  retiredPostSlugSchema,
);
