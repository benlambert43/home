import {
  PROJECT_ADJECTIVES,
  USERNAME_ADJECTIVES,
} from "@/app/projects/software/namegenerator/words/ADJECTIVES";
import { ANIMALS } from "@/app/projects/software/namegenerator/words/ANIMALS";
import { BRAND_SUFFIXES } from "@/app/projects/software/namegenerator/words/BRAND_SUFFIXES";
import {
  PROJECT_ALLITERATION_CHANCE,
  PROJECT_NOUN_CHANCE,
  USERNAME_ALLITERATION_CHANCE,
  USERNAME_ANIMAL_CHANCE,
} from "@/app/projects/software/namegenerator/words/CHANCES";
import { CODA_ONSET_PAIRS } from "@/app/projects/software/namegenerator/words/CODA_ONSET_PAIRS";
import { COLORS } from "@/app/projects/software/namegenerator/words/COLORS";
import {
  BATCH_SIZE,
  MAX_ATTEMPTS,
  MAX_COINED_LETTERS,
  MAX_COINED_SYLLABLES,
  MAX_PROJECT_LETTERS,
  MAX_PROJECT_SYLLABLES,
  MAX_USERNAME_LETTERS,
  MAX_USERNAME_SYLLABLES,
  MIN_BLEND_PART_LETTERS,
  MIN_COINED_LETTERS,
  SEAM_LETTERS,
} from "@/app/projects/software/namegenerator/words/LIMITS";
import { NOUNS } from "@/app/projects/software/namegenerator/words/NOUNS";
import { ONSETS } from "@/app/projects/software/namegenerator/words/ONSETS";
import { RECIPE_WEIGHTS } from "@/app/projects/software/namegenerator/words/RECIPE_WEIGHTS";
import {
  PROJECT_JOINERS,
  USERNAME_SEPARATORS,
} from "@/app/projects/software/namegenerator/words/SEPARATORS";
import { TECH_TAILS } from "@/app/projects/software/namegenerator/words/TECH_TAILS";
import {
  GeneratedName,
  Mode,
  ProjectFormat,
  ProjectStyle,
  UsernameDigits,
  UsernameOptions,
} from "@/app/projects/software/namegenerator/words/types";
import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";

type Candidate = { parts: string[]; sources: string[] };

const randomIndex = (length: number) => Math.floor(Math.random() * length);

const pick = <T>(items: readonly T[]) => items[randomIndex(items.length)];

const chance = (probability: number) => Math.random() < probability;

const pickWeighted = <T extends string>(weights: Record<T, number>): T => {
  const entries = Object.entries(weights) as [T, number][];
  let roll =
    Math.random() * entries.reduce((total, [, weight]) => total + weight, 0);

  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll < 0) return value;
  }

  return entries[entries.length - 1][0];
};

const isVowel = (letter: string) => /[aeiouy]/.test(letter);

const isSeamVowel = (letter: string) => /[aeiou]/.test(letter);

const letterRuns = (word: string) => word.match(/[aeiouy]+|[^aeiouy]+/g) ?? [];

const syllableCount = (word: string) => {
  const spoken = /[^aeiouy]le$/.test(word) ? word : word.replace(/e$/, "");
  const vowelGroups = spoken.replace(/^y/, "").match(/[aeiouy]+/g) ?? [];
  return Math.max(1, vowelGroups.length);
};

const syllables = (word: string) => {
  const runs = letterRuns(word);
  const result: string[] = [];
  let current = "";

  runs.forEach((run, index) => {
    const isLastRun = index === runs.length - 1;

    if (isVowel(run[0]) || isLastRun || current === "") {
      current += run;
      return;
    }

    if (run.length === 1) {
      result.push(current);
      current = run;
      return;
    }

    const onset = ONSETS.has(run.slice(-2)) ? run.slice(-2) : run.slice(1);
    result.push(current + run.slice(0, run.length - onset.length));
    current = onset;
  });

  result.push(current);

  const last = result[result.length - 1];
  if (result.length > 1 && /^[^aeiouy]*e$/.test(last)) {
    result.splice(result.length - 2, 2, result[result.length - 2] + last);
  }

  return result;
};

const profanity = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const clean = (text: string) => !profanity.hasMatch(text);

const cleanSeam = (left: string, right: string) =>
  clean(left.slice(-SEAM_LETTERS) + right.slice(0, SEAM_LETTERS));

const smoothCluster = (cluster: string) => {
  if (cluster.length <= 1) return true;
  if (cluster.length === 2) {
    return (
      ONSETS.has(cluster) ||
      CODA_ONSET_PAIRS.test(cluster) ||
      cluster[0] === cluster[1]
    );
  }
  return (
    cluster.length === 3 &&
    cluster[0] !== cluster[1] &&
    /^[lmnrs]/.test(cluster) &&
    ONSETS.has(cluster.slice(1))
  );
};

const smoothJunction = (left: string, right: string) => {
  const trailing = left.match(/[^aeiouy]+$/)?.[0] ?? "";
  const leading = right.match(/^[^aeiouy]+/)?.[0] ?? "";
  if (trailing === "" && leading === "") {
    return !isSeamVowel(left[left.length - 1]) || !isSeamVowel(right[0]);
  }
  return smoothCluster(trailing + leading);
};

const joinable = (left: string, right: string) => {
  const last = left[left.length - 1];
  const first = right[0];
  return (
    last !== first &&
    !(isSeamVowel(last) && isSeamVowel(first)) &&
    cleanSeam(left, right)
  );
};

const fits = (parts: string[], maxLetters: number, maxSyllables: number) =>
  parts.join("").length <= maxLetters &&
  parts.reduce((total, part) => total + syllableCount(part), 0) <= maxSyllables;

const NOUN_WORDS = new Set(NOUNS);

const coined = (word: string, sources: string[]) =>
  word.length >= MIN_COINED_LETTERS &&
  word.length <= MAX_COINED_LETTERS &&
  syllableCount(word) >= 2 &&
  syllableCount(word) <= MAX_COINED_SYLLABLES &&
  !NOUN_WORDS.has(word) &&
  !sources.includes(word) &&
  clean(word);

const suffixed = (stem: string, suffix: string) => {
  const base = stem.replace(/[aeiouy]+$/, "");
  const lastLetter = base[base.length - 1];

  if (
    base.length < 3 ||
    suffix.includes(lastLetter) ||
    /[^aeiouy]{3}$/.test(base) ||
    !smoothJunction(base, suffix)
  ) {
    return undefined;
  }

  const word = base + suffix;
  return coined(word, [stem]) ? word : undefined;
};

const blend = (first: string, second: string) => {
  const head = syllables(first);
  const tail = syllables(second);
  if (head.length < 2 || tail.length < 2) return undefined;

  const [start] = head;
  const end = tail[tail.length - 1];
  if (
    start.length < MIN_BLEND_PART_LETTERS ||
    end.length < MIN_BLEND_PART_LETTERS ||
    !smoothJunction(start, end)
  ) {
    return undefined;
  }

  const word = start + end;
  return coined(word, [first, second]) ? word : undefined;
};

const compound = (
  modifiers: readonly string[],
  nouns: readonly string[],
  alliterationChance: number,
): Candidate | undefined => {
  const modifier = pick(modifiers);
  const alliterative = chance(alliterationChance)
    ? nouns.filter((noun) => noun[0] === modifier[0])
    : [];
  const noun = pick(alliterative.length > 0 ? alliterative : nouns);

  if (noun === modifier || !joinable(modifier, noun)) return undefined;
  return { parts: [modifier, noun], sources: [modifier, noun] };
};

const PROJECT_MODIFIERS = [...PROJECT_ADJECTIVES, ...COLORS];
const USERNAME_MODIFIERS = [...USERNAME_ADJECTIVES, ...COLORS];
const BLENDABLE_NOUNS = NOUNS.filter((stem) => syllables(stem).length >= 2);

const projectCandidate = (style: ProjectStyle): Candidate | undefined => {
  const recipe = pickWeighted(RECIPE_WEIGHTS[style]);

  switch (recipe) {
    case "compound": {
      const candidate = compound(
        PROJECT_MODIFIERS,
        chance(PROJECT_NOUN_CHANCE) ? NOUNS : ANIMALS,
        PROJECT_ALLITERATION_CHANCE,
      );
      return candidate &&
        fits(candidate.parts, MAX_PROJECT_LETTERS, MAX_PROJECT_SYLLABLES)
        ? candidate
        : undefined;
    }
    case "techCompound": {
      const head = pick(NOUNS);
      const tail = pick(TECH_TAILS);
      const parts = [head, tail];
      return head !== tail &&
        joinable(head, tail) &&
        fits(parts, MAX_PROJECT_LETTERS, MAX_PROJECT_SYLLABLES)
        ? { parts, sources: parts }
        : undefined;
    }
    case "suffix": {
      const stem = pick(NOUNS);
      const word = suffixed(stem, pick(BRAND_SUFFIXES));
      return word ? { parts: [word], sources: [stem] } : undefined;
    }
    case "blend": {
      const first = pick(BLENDABLE_NOUNS);
      const second = pick(BLENDABLE_NOUNS);
      const word = first === second ? undefined : blend(first, second);
      return word ? { parts: [word], sources: [first, second] } : undefined;
    }
  }
};

const usernameCandidate = (): Candidate | undefined => {
  const candidate = compound(
    USERNAME_MODIFIERS,
    chance(USERNAME_ANIMAL_CHANCE) ? ANIMALS : NOUNS,
    USERNAME_ALLITERATION_CHANCE,
  );
  return candidate &&
    fits(candidate.parts, MAX_USERNAME_LETTERS, MAX_USERNAME_SYLLABLES)
    ? candidate
    : undefined;
};

export const generateBatch = (
  mode: Mode,
  style: ProjectStyle,
): GeneratedName[] => {
  const names: GeneratedName[] = [];
  const used = new Set<string>();

  for (
    let attempt = 0;
    attempt < MAX_ATTEMPTS && names.length < BATCH_SIZE;
    attempt++
  ) {
    const candidate =
      mode === "project" ? projectCandidate(style) : usernameCandidate();
    if (!candidate) continue;

    const key = candidate.parts.join("");
    if (used.has(key) || candidate.sources.some((source) => used.has(source)))
      continue;

    used.add(key);
    candidate.sources.forEach((source) => used.add(source));
    names.push({
      id: `${key}-${attempt}`,
      parts: candidate.parts,
      number: randomIndex(10000),
    });
  }

  return names;
};

const capitalize = (word: string) =>
  word.charAt(0).toUpperCase() + word.slice(1);

export const formatProjectName = (
  { parts }: GeneratedName,
  format: ProjectFormat,
) =>
  format === "pascal"
    ? parts.map(capitalize).join("")
    : parts.join(PROJECT_JOINERS[format]);

const digitsFor = (number: number, digits: UsernameDigits) => {
  if (digits === "none") return [];
  return [
    String(digits === "two" ? 10 + (number % 90) : 1000 + (number % 9000)),
  ];
};

export const formatUsername = (
  { parts, number }: GeneratedName,
  { separator, digits, casing }: UsernameOptions,
) =>
  [
    ...(casing === "capital" ? parts.map(capitalize) : parts),
    ...digitsFor(number, digits),
  ].join(USERNAME_SEPARATORS[separator]);
