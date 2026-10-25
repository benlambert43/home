import { PARAMS } from "@/app/projects/software/namegenerator/params";
import { normalizeKeyword } from "@/app/projects/software/namegenerator/words/generateNames";
import { MAX_PINS } from "@/app/projects/software/namegenerator/words/LIMITS";
import { decodeSeed } from "@/app/projects/software/namegenerator/words/random";
import {
  LengthChoice,
  Mode,
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
  length: LengthChoice;
  theme: Theme;
  keyword?: string;
  pins: string[];
  format: ProjectFormat;
  separator: UsernameSeparator;
  digits: UsernameDigits;
  casing: UsernameCase;
};

export type GeneratorState = GeneratorSettings & { seed: string };

export const MODES: readonly Mode[] = ["project", "username"];
export const STYLES: readonly ProjectStyle[] = [
  "any",
  "compound",
  "triple",
  "invented",
  "mix",
];
export const LENGTHS: readonly LengthChoice[] = [
  "any",
  "short",
  "medium",
  "long",
];
export const THEMES: readonly Theme[] = [
  "any",
  "nature",
  "space",
  "workshop",
  "mythology",
  "kitchen",
  "tech",
  "music",
  "games",
];
export const FORMATS: readonly ProjectFormat[] = ["pascal", "kebab", "lower"];
export const SEPARATORS: readonly UsernameSeparator[] = [
  "none",
  "underscore",
  "hyphen",
];
export const DIGITS: readonly UsernameDigits[] = ["none", "two", "four"];
export const CASES: readonly UsernameCase[] = ["capital", "lower"];

export const DEFAULT_SETTINGS: GeneratorSettings = {
  mode: "project",
  style: "any",
  length: "any",
  theme: "any",
  pins: [],
  format: "pascal",
  separator: "none",
  digits: "none",
  casing: "capital",
};

type SearchParamValues = Record<string, string | string[] | undefined>;

const choose = <T extends string>(
  value: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T,
): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

export const parsePins = (
  value: string | string[] | undefined,
  keyword: string | undefined,
) =>
  typeof value === "string"
    ? [
        ...new Set(
          value
            .split(",")
            .map((pin) => normalizeKeyword(pin))
            .filter(
              (pin): pin is string => pin !== undefined && pin !== keyword,
            ),
        ),
      ].slice(0, MAX_PINS - (keyword === undefined ? 0 : 1))
    : [];

export const parseGeneratorState = (
  params: SearchParamValues,
  fallbackSeed: string,
): GeneratorState => {
  const word = params[PARAMS.keyword];
  const keyword = typeof word === "string" ? normalizeKeyword(word) : undefined;
  const seed = params[PARAMS.seed];

  return {
    mode: choose(params[PARAMS.mode], MODES, DEFAULT_SETTINGS.mode),
    style: choose(params[PARAMS.style], STYLES, DEFAULT_SETTINGS.style),
    length: choose(params[PARAMS.length], LENGTHS, DEFAULT_SETTINGS.length),
    theme: choose(params[PARAMS.theme], THEMES, DEFAULT_SETTINGS.theme),
    keyword,
    pins: parsePins(params[PARAMS.pins], keyword),
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
    [PARAMS.pins, state.pins.length > 0 ? state.pins.join(",") : undefined],
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
