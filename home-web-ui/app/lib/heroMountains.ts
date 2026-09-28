import { MOUNTAIN_EFFECTS } from "@/app/ui/Mountains";

export const MOUNTAINS_PAUSED_COOKIE = "mountainsPaused";

export const MOUNTAINS_PLAYED_COOKIE = "mountainsPlayed";

export const randomMountainEffect = () =>
  MOUNTAIN_EFFECTS[Math.floor(Math.random() * MOUNTAIN_EFFECTS.length)];
