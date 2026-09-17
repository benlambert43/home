import mongoose from "mongoose";
import { postSchema } from "../schema/postSchema";
import { PostDocument } from "../types/db";

export const PostModel = mongoose.model<PostDocument>("post", postSchema);

export const WITH_REVISIONS = { "revisions.0": { $exists: true } };

export const CURRENT_REVISION_ONLY = { revisions: { $slice: -1 } };

export const CURRENT_AND_PREVIOUS_REVISIONS = { revisions: { $slice: -2 } };
