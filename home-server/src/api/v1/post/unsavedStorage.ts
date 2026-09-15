import { QueryFilter } from "mongoose";
import { PostModel } from "../model/postModel";
import { PostDocument } from "../types/db";

export const deleteUnsavedStorage = async (
  saved: QueryFilter<PostDocument>,
  storage: string,
  deleteStorage: () => Promise<void>,
) => {
  const mayBeSaved = await PostModel.exists(saved).then(
    (post) => post !== null,
    (lookupError: unknown) => {
      console.error(
        `Kept storage for ${storage}, MongoDB could not confirm it was not saved:`,
        lookupError,
      );
      return true;
    },
  );

  if (mayBeSaved) return;

  await deleteStorage().catch((cleanupError: unknown) => {
    console.error(`Failed to clean up storage for ${storage}:`, cleanupError);
  });
};
