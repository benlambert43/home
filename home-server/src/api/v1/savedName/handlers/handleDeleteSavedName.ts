import { SavedNameModel } from "../../model/savedNameModel";
import { savedNamesSummary } from "../savedNamesSummary";

export const handleDeleteSavedName = async (userId: string, id: string) => {
  const { deletedCount } = await SavedNameModel.deleteOne({ _id: id, userId });

  return deletedCount === 1 ? savedNamesSummary(userId) : undefined;
};
