import { curate } from "@/app/projects/software/namegenerator/words/curate";
import { CLIMBING_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/CLIMBING";
import { KITCHEN_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/KITCHEN";
import { MYTHOLOGY_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/MYTHOLOGY";
import { NATURE_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/NATURE";
import { SPACE_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/SPACE";
import { TECH_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/TECH";
import {
  WESTERN_MOUNTAINS,
  WESTERN_RIVERS,
} from "@/app/projects/software/namegenerator/words/nouns/WESTERN";
import { WORKSHOP_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/WORKSHOP";
import { ThemeName } from "@/app/projects/software/namegenerator/words/types";

export const NOUNS_BY_THEME: Record<ThemeName, string[]> = {
  nature: curate(NATURE_NOUNS),
  space: curate(SPACE_NOUNS),
  workshop: curate(WORKSHOP_NOUNS),
  mythology: curate(MYTHOLOGY_NOUNS),
  kitchen: curate(KITCHEN_NOUNS),
  tech: curate(TECH_NOUNS),
};

export const CLIMBING = curate(CLIMBING_NOUNS);

export const LANDMARKS = curate([...WESTERN_MOUNTAINS, ...WESTERN_RIVERS]);

export const NOUNS = curate([
  ...Object.values(NOUNS_BY_THEME).flat(),
  ...CLIMBING,
  ...LANDMARKS,
]);

export const THEME_NAMES = Object.keys(NOUNS_BY_THEME) as ThemeName[];
