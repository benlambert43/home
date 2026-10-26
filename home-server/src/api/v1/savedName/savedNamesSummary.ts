import { MAX_SAVED_NAMES, SavedNamesSummary } from "@home/shared";
import { SavedNameModel } from "../model/savedNameModel";

export const savedNamesSummary = async (
  userId: string,
): Promise<SavedNamesSummary> => ({
  total: await SavedNameModel.countDocuments({ userId }),
  limit: MAX_SAVED_NAMES,
});
