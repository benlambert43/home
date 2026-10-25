import { curate } from "@/app/projects/software/namegenerator/words/curate";
import { KITCHEN_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/KITCHEN";
import { MYTHOLOGY_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/MYTHOLOGY";
import { NATURE_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/NATURE";
import { SPACE_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/SPACE";
import { TECH_NOUNS } from "@/app/projects/software/namegenerator/words/nouns/TECH";
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

export const NOUNS = curate(Object.values(NOUNS_BY_THEME).flat());

export const THEME_NAMES = Object.keys(NOUNS_BY_THEME) as ThemeName[];
