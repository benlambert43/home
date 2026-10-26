import { SavedNameListQuery } from "@home/shared";
import { SavedNameModel } from "../../model/savedNameModel";
import { serializeSavedName } from "../../types/serialize";
import { savedNamesSummary } from "../savedNamesSummary";

export const handleGetSavedNames = async (
  userId: string,
  { page, pageSize }: SavedNameListQuery,
) => {
  const summary = await savedNamesSummary(userId);

  const names = await SavedNameModel.find({ userId })
    .sort({ _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return {
    ...summary,
    names: names.map(serializeSavedName),
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(summary.total / pageSize)),
  };
};
