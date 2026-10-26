export const MAX_SAVED_NAMES = 10000;

export const MAX_SAVED_NAME_PARTS = 4;

export const MAX_SAVED_NAME_PART_LETTERS = 24;

export const MAX_SAVED_NAME_NUMBER = 9999;

export const DEFAULT_SAVED_NAMES_PAGE_SIZE = 12;

export const MAX_SAVED_NAMES_PAGE_SIZE = 100;

export const MAX_SAVED_NAME_LOOKUP = 50;

export const savedNameKey = (parts: readonly string[]) => parts.join(" ");

export interface SavedNameFields<Id = string, Timestamp = string> {
  _id: Id;
  userId: Id;
  parts: string[];
  number: number;
  savedDate: Timestamp;
}

export type SavedName = SavedNameFields;

export interface SavedNamesSummary {
  total: number;
  limit: number;
}
