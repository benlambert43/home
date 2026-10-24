import { normalizeKeyword } from "@/app/projects/software/namegenerator/words/generateNames";
import { decodeSeed } from "@/app/projects/software/namegenerator/words/random";
import {
  Mode,
  NameLength,
  ProjectFormat,
  ProjectStyle,
  Theme,
  UsernameCase,
  UsernameDigits,
  UsernameSeparator,
} from "@/app/projects/software/namegenerator/words/types";

export type GeneratorSettings = {
  mode: Mode;
  style: ProjectStyle;
  length: NameLength;
  theme: Theme;
  keyword?: string;
  format: ProjectFormat;
  separator: UsernameSeparator;
  digits: UsernameDigits;
  casing: UsernameCase;
};

export type GeneratorState = GeneratorSettings & { seed: string };

export const MODES: readonly Mode[] = ["project", "username"];
export const STYLES: readonly ProjectStyle[] = ["compound", "invented", "mix"];
export const LENGTHS: readonly NameLength[] = ["short", "medium", "long"];
export const THEMES: readonly Theme[] = [
  "any",
  "nature",
  "space",
  "workshop",
  "mythology",
  "kitchen",
  "tech",
];
export const FORMATS: readonly ProjectFormat[] = ["pascal", "kebab", "lower"];
export const SEPARATORS: readonly UsernameSeparator[] = [
  "none",
  "underscore",
  "hyphen",
];
export const DIGITS: readonly UsernameDigits[] = ["none", "two", "four"];
export const CASES: readonly UsernameCase[] = ["lower", "capital"];

export const DEFAULT_SETTINGS: GeneratorSettings = {
  mode: "project",
  style: "mix",
  length: "medium",
  theme: "any",
  format: "pascal",
  separator: "none",
  digits: "none",
  casing: "lower",
};

const PARAMS = {
  mode: "type",
  style: "style",
  length: "length",
  theme: "theme",
  keyword: "word",
  format: "format",
  separator: "separator",
  digits: "digits",
  casing: "case",
  seed: "seed",
} as const;

type SearchParamValues = Record<string, string | string[] | undefined>;

const choose = <T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T,
): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

export const parseGeneratorState = (
  params: SearchParamValues,
  fallbackSeed: string,
): GeneratorState => {
  const word = params[PARAMS.keyword];
  const seed = params[PARAMS.seed];

  return {
    mode: choose(params[PARAMS.mode], MODES, DEFAULT_SETTINGS.mode),
    style: choose(params[PARAMS.style], STYLES, DEFAULT_SETTINGS.style),
    length: choose(params[PARAMS.length], LENGTHS, DEFAULT_SETTINGS.length),
    theme: choose(params[PARAMS.theme], THEMES, DEFAULT_SETTINGS.theme),
    keyword: typeof word === "string" ? normalizeKeyword(word) : undefined,
    format: choose(params[PARAMS.format], FORMATS, DEFAULT_SETTINGS.format),
    separator: choose(
      params[PARAMS.separator],
      SEPARATORS,
      DEFAULT_SETTINGS.separator,
    ),
    digits: choose(params[PARAMS.digits], DIGITS, DEFAULT_SETTINGS.digits),
    casing: choose(params[PARAMS.casing], CASES, DEFAULT_SETTINGS.casing),
    seed:
      (typeof seed === "string" ? decodeSeed(seed) : undefined) ?? fallbackSeed,
  };
};

export const generatorSearch = (state: GeneratorState) => {
  const params = new URLSearchParams();
  const entries: [string, string | undefined][] = [
    [
      PARAMS.mode,
      state.mode === DEFAULT_SETTINGS.mode ? undefined : state.mode,
    ],
    [PARAMS.keyword, state.keyword],
    [
      PARAMS.length,
      state.length === DEFAULT_SETTINGS.length ? undefined : state.length,
    ],
    [
      PARAMS.theme,
      state.theme === DEFAULT_SETTINGS.theme ? undefined : state.theme,
    ],
    [
      PARAMS.style,
      state.style === DEFAULT_SETTINGS.style ? undefined : state.style,
    ],
    [
      PARAMS.format,
      state.format === DEFAULT_SETTINGS.format ? undefined : state.format,
    ],
    [
      PARAMS.separator,
      state.separator === DEFAULT_SETTINGS.separator
        ? undefined
        : state.separator,
    ],
    [
      PARAMS.digits,
      state.digits === DEFAULT_SETTINGS.digits ? undefined : state.digits,
    ],
    [
      PARAMS.casing,
      state.casing === DEFAULT_SETTINGS.casing ? undefined : state.casing,
    ],
    [PARAMS.seed, state.seed],
  ];

  entries.forEach(([key, value]) => {
    if (value !== undefined) params.set(key, value);
  });

  return `?${params.toString()}`;
};
