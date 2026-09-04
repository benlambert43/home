import mongoose from "mongoose";
import { postSchema } from "../schema/postSchema";
import { PostDocument } from "../types/db";

export const PostModel = mongoose.model<PostDocument>("post", postSchema);

export const CURRENT_REVISION_ONLY = { revisions: { $slice: -1 } };
