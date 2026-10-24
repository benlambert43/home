export type Mode = "project" | "username";
export type ProjectStyle = "compound" | "invented" | "mix";
export type ProjectRecipe = "compound" | "techCompound" | "suffix" | "blend";
export type ProjectFormat = "pascal" | "kebab" | "lower";
export type UsernameSeparator = "none" | "underscore" | "hyphen";
export type UsernameDigits = "none" | "two" | "four";
export type UsernameCase = "lower" | "capital";

export type UsernameOptions = {
  separator: UsernameSeparator;
  digits: UsernameDigits;
  casing: UsernameCase;
};

export type GeneratedName = { id: string; parts: string[]; number: number };
