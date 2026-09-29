import { useSyncExternalStore } from "react";

const subscribe = (onScroll: () => void) => {
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
};

export const useScrolled = () =>
  useSyncExternalStore(
    subscribe,
    () => window.scrollY > 0,
    () => false,
  );
