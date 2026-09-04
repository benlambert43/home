import { Types } from "mongoose";
import { UserModel } from "../model/userModel";

export const findAuthorUsername = async (
  authorUserId: Types.ObjectId,
): Promise<string | null> =>
  (await UserModel.findById(authorUserId).select("username"))?.username ?? null;

export const findAuthorUsernames = async (authorUserIds: Types.ObjectId[]) => {
  const authors = await UserModel.find({
    _id: { $in: authorUserIds },
  }).select("username");

  return new Map(
    authors.map((author) => [author._id.toString(), author.username]),
  );
};
