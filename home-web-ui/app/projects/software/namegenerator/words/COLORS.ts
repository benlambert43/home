import { curate } from "@/app/projects/software/namegenerator/words/curate";
import { colors } from "unique-names-generator";

export const COLORS = curate(colors, ["moccasin", "tomato"]);
