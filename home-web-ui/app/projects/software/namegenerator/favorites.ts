import { GeneratedName } from "@/app/projects/software/namegenerator/words/types";
import { useMemo, useSyncExternalStore } from "react";

export const MAX_FAVORITES = 12;

export type Favorite = Pick<GeneratedName, "parts" | "number">;

export const favoriteKey = ({ parts }: Pick<Favorite, "parts">) =>
  parts.join(" ");

const STORAGE_KEY = "namegenerator.favorites";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const partsFromText = (text: string) =>
  text
    .replace(/\d+$/, "")
    .split(/[-_\s]+|(?<=[a-z])(?=[A-Z])/)
    .filter((part) => part !== "")
    .map((part) => part.toLowerCase());

const numberFromText = (text: string) => {
  const digits = /\d+$/.exec(text)?.[0];
  if (digits === undefined) return 0;
  return Math.max(0, Number(digits) - (digits.length > 2 ? 1000 : 10));
};

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

const toFavorite = (item: unknown): Favorite | undefined => {
  if (typeof item === "string") {
    return { parts: partsFromText(item), number: numberFromText(item) };
  }
  if (typeof item !== "object" || item === null) return undefined;
  const { text, parts, number } = item as Record<string, unknown>;
  if (!isStrings(parts)) return undefined;
  if (isNumber(number)) return { parts, number };
  return typeof text === "string"
    ? {
        parts: parts.length > 0 ? parts : partsFromText(text),
        number: numberFromText(text),
      }
    : undefined;
};

const parseStored = (raw: string): Favorite[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const byKey = new Map<string, Favorite>();
    for (const favorite of parsed.map(toFavorite)) {
      if (favorite === undefined || favorite.parts.length === 0) continue;
      const key = favoriteKey(favorite);
      if (!byKey.has(key)) byKey.set(key, favorite);
    }
    return [...byKey.values()].slice(0, MAX_FAVORITES);
  } catch {
    return [];
  }
};

const writeStored = (favorites: Favorite[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    return;
  }
  listeners.forEach((listener) => listener());
};

export const useFavorites = () => {
  const raw = useSyncExternalStore(subscribe, readStored, () => "");
  const favorites = useMemo(() => parseStored(raw), [raw]);

  const has = (name: Favorite) =>
    favorites.some((favorite) => favoriteKey(favorite) === favoriteKey(name));

  const add = ({ parts, number }: Favorite) => {
    if (has({ parts, number }) || favorites.length >= MAX_FAVORITES) return;
    writeStored([...favorites, { parts, number }]);
  };

  const remove = (name: Favorite) => {
    writeStored(
      favorites.filter(
        (favorite) => favoriteKey(favorite) !== favoriteKey(name),
      ),
    );
  };

  return {
    favorites,
    has,
    add,
    remove,
    full: favorites.length >= MAX_FAVORITES,
  };
};
