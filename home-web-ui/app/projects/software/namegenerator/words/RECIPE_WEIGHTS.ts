import {
  ProjectRecipe,
  ProjectStyle,
} from "@/app/projects/software/namegenerator/words/types";

export const RECIPE_WEIGHTS: Record<
  ProjectStyle,
  Record<ProjectRecipe, number>
> = {
  compound: {
    compound: 55,
    techCompound: 45,
    triple: 0,
    suffix: 0,
    blend: 0,
    hybridPair: 0,
    hybridTriple: 0,
  },
  triple: {
    compound: 0,
    techCompound: 0,
    triple: 100,
    suffix: 0,
    blend: 0,
    hybridPair: 0,
    hybridTriple: 0,
  },
  invented: {
    compound: 0,
    techCompound: 0,
    triple: 0,
    suffix: 40,
    blend: 60,
    hybridPair: 0,
    hybridTriple: 0,
  },
  mix: {
    compound: 15,
    techCompound: 10,
    triple: 25,
    suffix: 10,
    blend: 15,
    hybridPair: 15,
    hybridTriple: 10,
  },
  any: {
    compound: 4,
    techCompound: 4,
    triple: 4,
    suffix: 3,
    blend: 3,
    hybridPair: 2,
    hybridTriple: 2,
  },
};

export const OFF_TECH_TAIL_WEIGHT = 0.4;

export const USERNAME_RECIPE_WEIGHTS: Record<ProjectRecipe, number> = {
  compound: 1,
  techCompound: 0,
  triple: 0,
  suffix: 0,
  blend: 0,
  hybridPair: 0,
  hybridTriple: 0,
};
