import { mongo } from "mongoose";
import { SaveNameRequestBody, savedNameKey } from "@home/shared";
import { ApiError } from "../../http/apiError";
import { ApiMessage } from "../../http/messages";
import { SavedNameModel } from "../../model/savedNameModel";
import {
  SerializableSavedName,
  serializeSavedName,
} from "../../types/serialize";
import { savedNamesSummary } from "../savedNamesSummary";

const DUPLICATE_KEY = 11000;

const isDuplicateKey = (e: unknown) =>
  e instanceof mongo.MongoServerError && e.code === DUPLICATE_KEY;

const alreadySaved = async (userId: string, saved: SerializableSavedName) => ({
  ...(await savedNamesSummary(userId)),
  name: serializeSavedName(saved),
  created: false,
});

export const handleSaveName = async (
  userId: string,
  { parts, number }: SaveNameRequestBody,
) => {
  const key = savedNameKey(parts);

  const existing = await SavedNameModel.findOne({ userId, key });
  if (existing) return alreadySaved(userId, existing);

  const summary = await savedNamesSummary(userId);
  if (summary.total >= summary.limit) {
    throw new ApiError(ApiMessage.SAVED_NAMES_FULL);
  }

  try {
    const saved = await SavedNameModel.create({
      userId,
      key,
      parts,
      number,
      savedDate: new Date(),
    });

    return {
      ...summary,
      total: summary.total + 1,
      name: serializeSavedName(saved),
      created: true,
    };
  } catch (e) {
    if (!isDuplicateKey(e)) throw e;
  }

  return alreadySaved(
    userId,
    await SavedNameModel.findOne({ userId, key }).orFail(),
  );
};
