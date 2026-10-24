import {
  ProjectFormat,
  UsernameSeparator,
} from "@/app/projects/software/namegenerator/words/types";

export const PROJECT_JOINERS: Record<
  Exclude<ProjectFormat, "pascal">,
  string
> = {
  kebab: "-",
  lower: "",
};

export const USERNAME_SEPARATORS: Record<UsernameSeparator, string> = {
  none: "",
  underscore: "_",
  hyphen: "-",
};
