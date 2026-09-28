import { MOUNTAIN_EFFECTS } from "@/app/ui/Mountains";

export const MOUNTAINS_PAUSED_COOKIE = "mountainsPaused";

export const MOUNTAINS_PLAYED_COOKIE = "mountainsPlayed";

export const MOUNTAINS_EFFECT_COOKIE = "mountainsEffect";

export const nextMountainEffect = (effect?: string) =>
  MOUNTAIN_EFFECTS[
    (MOUNTAIN_EFFECTS.findIndex((candidate) => candidate === effect) + 1) %
      MOUNTAIN_EFFECTS.length
  ];
