import {
  ProjectRecipe,
  ProjectStyle,
} from "@/app/projects/software/namegenerator/words/types";

export const RECIPE_WEIGHTS: Record<
  ProjectStyle,
  Record<ProjectRecipe, number>
> = {
  compound: { compound: 55, techCompound: 45, suffix: 0, blend: 0 },
  invented: { compound: 0, techCompound: 0, suffix: 40, blend: 60 },
  mix: { compound: 35, techCompound: 25, suffix: 15, blend: 25 },
};
