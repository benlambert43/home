import { SavedNameListQuery } from "@home/shared";
import { SavedNameModel } from "../../model/savedNameModel";
import { serializeSavedName } from "../../types/serialize";
import { savedNamesSummary } from "../savedNamesSummary";

export const handleGetSavedNames = async (
  userId: string,
  { before, pageSize }: SavedNameListQuery,
) => {
  const found = await SavedNameModel.find(
    before === undefined ? { userId } : { userId, _id: { $lt: before } },
  )
    .sort({ _id: -1 })
    .limit(pageSize + 1);

  const names = found.slice(0, pageSize).map(serializeSavedName);
  const last = found.length > pageSize ? names[names.length - 1] : undefined;

  return {
    ...(await savedNamesSummary(userId)),
    names,
    nextCursor: last?._id ?? null,
  };
};
