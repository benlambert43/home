export const PARAMS = {
  mode: "type",
  style: "style",
  length: "length",
  theme: "theme",
  keyword: "word",
  pins: "pins",
  format: "format",
  separator: "separator",
  digits: "digits",
  casing: "case",
  seed: "seed",
} as const;

const PARAM_NAMES = new Set<string>(Object.values(PARAMS));

export const hasGeneratorParams = (names: Iterable<string>) =>
  [...names].some((name) => PARAM_NAMES.has(name));
