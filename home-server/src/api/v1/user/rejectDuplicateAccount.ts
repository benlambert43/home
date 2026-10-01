import { mongo } from "mongoose";
import { ApiError } from "../http/apiError";
import { accountAlreadyExists } from "../http/messages";

const DUPLICATE_KEY = 11000;

const UNIQUE_ACCOUNT_FIELDS = ["email", "username"] as const;

export const rejectDuplicateAccount = async <T>(write: PromiseLike<T>) => {
  try {
    return await write;
  } catch (e) {
    if (e instanceof mongo.MongoServerError && e.code === DUPLICATE_KEY) {
      const keyPattern = (e.keyPattern ?? {}) as Record<string, unknown>;
      const field = UNIQUE_ACCOUNT_FIELDS.find((name) => name in keyPattern);
      if (field) throw new ApiError(accountAlreadyExists(field));
    }

    throw e;
  }
};
