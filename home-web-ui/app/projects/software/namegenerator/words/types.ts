export type Mode = "project" | "username";
export type ProjectStyle = "compound" | "triple" | "invented" | "mix";
export type ProjectRecipe =
  | "compound"
  | "techCompound"
  | "triple"
  | "suffix"
  | "blend"
  | "hybridPair"
  | "hybridTriple";
export type ProjectFormat = "pascal" | "kebab" | "lower";
export type UsernameSeparator = "none" | "underscore" | "hyphen";
export type UsernameDigits = "none" | "two" | "four";
export type UsernameCase = "lower" | "capital";
export type NameLength = "short" | "medium" | "long";
export type ThemeName =
  "nature" | "space" | "workshop" | "mythology" | "kitchen" | "tech";
export type Theme = "any" | ThemeName;

export type GenerateOptions = {
  mode: Mode;
  style: ProjectStyle;
  length: NameLength;
  theme: Theme;
  keyword?: string;
  pins?: readonly string[];
};

export type UsernameOptions = {
  separator: UsernameSeparator;
  digits: UsernameDigits;
  casing: UsernameCase;
};

export type GeneratedName = { id: string; parts: string[]; number: number };
