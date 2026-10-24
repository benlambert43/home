import { useMemo, useSyncExternalStore } from "react";

export const MAX_FAVORITES = 12;

export type Favorite = { text: string; parts: string[] };

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

const toFavorite = (item: unknown): Favorite | undefined => {
  if (typeof item === "string") return { text: item, parts: [] };
  if (typeof item !== "object" || item === null) return undefined;
  const { text, parts } = item as Record<string, unknown>;
  return typeof text === "string" && isStrings(parts)
    ? { text, parts }
    : undefined;
};

const parseStored = (raw: string): Favorite[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .map(toFavorite)
          .filter((item) => item !== undefined)
          .slice(0, MAX_FAVORITES)
      : [];
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

  const has = (text: string) =>
    favorites.some((favorite) => favorite.text === text);

  const add = (favorite: Favorite) => {
    if (has(favorite.text) || favorites.length >= MAX_FAVORITES) return;
    writeStored([...favorites, favorite]);
  };

  const remove = (text: string) => {
    writeStored(favorites.filter((favorite) => favorite.text !== text));
  };

  return {
    favorites,
    has,
    add,
    remove,
    full: favorites.length >= MAX_FAVORITES,
  };
};
