import { LookupSavedNamesRequestBody, savedNameKey } from "@home/shared";
import { SavedNameModel } from "../../model/savedNameModel";
import { serializeSavedName } from "../../types/serialize";
import { savedNamesSummary } from "../savedNamesSummary";

export const handleLookupSavedNames = async (
  userId: string,
  { names }: LookupSavedNamesRequestBody,
) => {
  const keys = names.map(({ parts }) => savedNameKey(parts));
  const found = await SavedNameModel.find({ userId, key: { $in: keys } });

  return {
    ...(await savedNamesSummary(userId)),
    names: found.map(serializeSavedName),
  };
};
