import { useMemo, useSyncExternalStore } from "react";

export const MAX_FAVORITES = 12;

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

const parseStored = (raw: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === "string")
          .slice(0, MAX_FAVORITES)
      : [];
  } catch {
    return [];
  }
};

const writeStored = (favorites: string[]) => {
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

  const add = (name: string) => {
    if (favorites.includes(name) || favorites.length >= MAX_FAVORITES) return;
    writeStored([...favorites, name]);
  };

  const remove = (name: string) => {
    writeStored(favorites.filter((favorite) => favorite !== name));
  };

  return { favorites, add, remove, full: favorites.length >= MAX_FAVORITES };
};
