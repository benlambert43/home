import mongoose from "mongoose";
import { userSchema } from "../schema/userSchema";

export const UserModel = mongoose.model("user", userSchema);
