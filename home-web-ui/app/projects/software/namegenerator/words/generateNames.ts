import {
  PROJECT_ADJECTIVES,
  PROJECT_ADJECTIVES_BY_THEME,
  USERNAME_ADJECTIVES,
  USERNAME_ADJECTIVES_BY_THEME,
} from "@/app/projects/software/namegenerator/words/ADJECTIVES";
import { ANIMALS } from "@/app/projects/software/namegenerator/words/ANIMALS";
import { BRAND_SUFFIXES } from "@/app/projects/software/namegenerator/words/BRAND_SUFFIXES";
import {
  CROSS_THEME_CHANCE,
  KEYWORD_FIRST_CHANCE,
  KEYWORD_MODIFIER_CHANCE,
  PROJECT_ALLITERATION_CHANCE,
  PROJECT_NOUN_CHANCE,
  SUFFIX_SHARE,
  USERNAME_ALLITERATION_CHANCE,
  USERNAME_ANIMAL_CHANCE,
} from "@/app/projects/software/namegenerator/words/CHANCES";
import { CODA_ONSET_PAIRS } from "@/app/projects/software/namegenerator/words/CODA_ONSET_PAIRS";
import { COLORS } from "@/app/projects/software/namegenerator/words/COLORS";
import {
  BATCH_SIZE,
  COINED_WINDOWS,
  KEYWORD_WINDOW_SLACK,
  LengthWindow,
  MAX_ALLITERATIVE_PER_BATCH,
  MAX_ATTEMPTS,
  MAX_KEYWORD_LETTERS,
  MIN_BLEND_PART_LETTERS,
  MIN_KEYWORD_LETTERS,
  MIN_ROOT_OVERLAP,
  POOL_SIZE,
  PROJECT_WINDOWS,
  SEAM_LETTERS,
  TRIPLE_WINDOWS,
  USERNAME_WINDOWS,
} from "@/app/projects/software/namegenerator/words/LIMITS";
import {
  NOUNS,
  NOUNS_BY_THEME,
} from "@/app/projects/software/namegenerator/words/NOUNS";
import { ONSETS } from "@/app/projects/software/namegenerator/words/ONSETS";
import { createRandom } from "@/app/projects/software/namegenerator/words/random";
import { RECIPE_WEIGHTS } from "@/app/projects/software/namegenerator/words/RECIPE_WEIGHTS";
import {
  DOUBLE_LETTER_PENALTY,
  IDEAL_VOWEL_RATIO,
  SCORE_WEIGHTS,
} from "@/app/projects/software/namegenerator/words/SCORE_WEIGHTS";
import {
  PROJECT_JOINERS,
  USERNAME_SEPARATORS,
} from "@/app/projects/software/namegenerator/words/SEPARATORS";
import { TECH_TAILS } from "@/app/projects/software/namegenerator/words/TECH_TAILS";
import {
  GeneratedName,
  GenerateOptions,
  NameLength,
  ProjectFormat,
  ProjectRecipe,
  ThemeName,
  UsernameDigits,
  UsernameOptions,
} from "@/app/projects/software/namegenerator/words/types";
import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";

type Candidate = {
  parts: string[];
  sources: string[];
  alliterative: boolean;
  window: LengthWindow;
};

type Pools = {
  adjectives: string[];
  modifiers: string[];
  nouns: string[];
  animals: string[];
  blendable: string[];
  crossAdjectives: string[];
  crossNouns: string[];
  crossBlendable: string[];
};

let nextRandom: () => number = Math.random;

const randomIndex = (length: number) => Math.floor(nextRandom() * length);

const pick = <T>(items: readonly T[]) => items[randomIndex(items.length)];

const chance = (probability: number) => nextRandom() < probability;

const pickWeighted = <T extends string>(weights: Record<T, number>): T => {
  const entries = Object.entries(weights) as [T, number][];
  let roll =
    nextRandom() * entries.reduce((total, [, weight]) => total + weight, 0);

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

const totalSyllables = (parts: string[]) =>
  parts.reduce((total, part) => total + syllableCount(part), 0);

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

export const normalizeKeyword = (raw: string) => {
  const words = raw.toLowerCase().match(/[a-z]+/g) ?? [];
  const joined = words.join("");
  const keyword =
    joined.length <= MAX_KEYWORD_LETTERS ? joined : (words[0] ?? "");
  return keyword.length >= MIN_KEYWORD_LETTERS &&
    keyword.length <= MAX_KEYWORD_LETTERS &&
    clean(keyword)
    ? keyword
    : undefined;
};

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

const sharesRoot = (left: string, right: string) =>
  right.startsWith(left.slice(0, MIN_ROOT_OVERLAP)) ||
  left.startsWith(right.slice(0, MIN_ROOT_OVERLAP));

const joinable = (left: string, right: string) => {
  const last = left[left.length - 1];
  const first = right[0];
  return (
    last !== first &&
    !(isSeamVowel(last) && isSeamVowel(first)) &&
    cleanSeam(left, right)
  );
};

const fits = (parts: string[], window: LengthWindow) => {
  const letters = parts.join("").length;
  return (
    letters >= window.minLetters &&
    letters <= window.maxLetters &&
    totalSyllables(parts) <= window.maxSyllables
  );
};

const aroundKeyword = (
  window: LengthWindow,
  keyword: string,
  partners = 1,
): LengthWindow => ({
  minLetters: Math.min(window.minLetters, keyword.length),
  maxLetters: Math.max(
    window.maxLetters,
    keyword.length + KEYWORD_WINDOW_SLACK * partners,
  ),
  maxSyllables: Math.max(window.maxSyllables, syllableCount(keyword) + 1),
  idealSyllables: Math.max(window.idealSyllables, syllableCount(keyword) + 1),
});

const NOUN_WORDS = new Set(NOUNS);

const coined = (word: string, sources: string[], window: LengthWindow) =>
  fits([word], window) &&
  syllableCount(word) >= 2 &&
  !NOUN_WORDS.has(word) &&
  !sources.includes(word) &&
  clean(word);

const suffixed = (stem: string, suffix: string, window: LengthWindow) => {
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
  return coined(word, [stem], window) ? word : undefined;
};

const blend = (first: string, second: string, window: LengthWindow) => {
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
  return coined(word, [first, second], window) ? word : undefined;
};

const assemble = (
  parts: string[],
  window: LengthWindow,
  sources: string[] = parts,
): Candidate | undefined => {
  if (new Set(parts).size !== parts.length || !fits(parts, window)) {
    return undefined;
  }

  for (let index = 1; index < parts.length; index++) {
    const left = parts[index - 1];
    const right = parts[index];
    if (sharesRoot(left, right) || !joinable(left, right)) return undefined;
  }

  return {
    parts,
    sources,
    alliterative: parts[0][0] === parts[1][0],
    window,
  };
};

const compound = (
  modifiers: readonly string[],
  nouns: readonly string[],
  alliterationChance: number,
  window: LengthWindow,
): Candidate | undefined => {
  const modifier = pick(modifiers);
  const alliterative = chance(alliterationChance)
    ? nouns.filter((noun) => noun[0] === modifier[0])
    : [];
  const noun = pick(alliterative.length > 0 ? alliterative : nouns);
  return assemble([modifier, noun], window);
};

const blendKeyword = (
  keyword: string,
  noun: string,
  window: LengthWindow,
  keywordFirst: boolean,
) => {
  const keywordSyllables = syllables(keyword);
  const nounSyllables = syllables(noun);
  if (nounSyllables.length < 2) return undefined;

  const keywordHead =
    keywordSyllables.length >= 2 ? keywordSyllables[0] : keyword;
  const keywordTail =
    keywordSyllables.length >= 2
      ? keywordSyllables[keywordSyllables.length - 1]
      : keyword;
  const start = keywordFirst ? keywordHead : nounSyllables[0];
  const end = keywordFirst
    ? nounSyllables[nounSyllables.length - 1]
    : keywordTail;

  if (
    start.length < MIN_BLEND_PART_LETTERS ||
    end.length < MIN_BLEND_PART_LETTERS ||
    !smoothJunction(start, end)
  ) {
    return undefined;
  }

  const word = start + end;
  return coined(word, [keyword, noun], window) ? word : undefined;
};

const blendableOf = (nouns: readonly string[]) =>
  nouns.filter((noun) => syllables(noun).length >= 2);

const poolsFor = ({ mode, style, theme }: GenerateOptions): Pools => {
  const general = mode === "project" ? PROJECT_ADJECTIVES : USERNAME_ADJECTIVES;
  const themed =
    mode === "project"
      ? PROJECT_ADJECTIVES_BY_THEME
      : USERNAME_ADJECTIVES_BY_THEME;
  const themedAdjectives =
    theme === "any" ? Object.values(themed).flat() : themed[theme];
  const nouns = theme === "any" ? NOUNS : NOUNS_BY_THEME[theme];
  const adjectives = [...new Set([...general, ...themedAdjectives])];
  const crossing = mode === "project" && style === "mix" && theme !== "any";
  const otherThemes = crossing
    ? (Object.keys(NOUNS_BY_THEME) as ThemeName[]).filter(
        (other) => other !== theme,
      )
    : [];
  const crossNouns = [
    ...otherThemes.flatMap((other) => NOUNS_BY_THEME[other]),
    ...(crossing && theme !== "nature" ? ANIMALS : []),
  ];

  return {
    adjectives,
    modifiers: [...new Set([...adjectives, ...COLORS])],
    nouns,
    animals: theme === "any" || theme === "nature" ? ANIMALS : [],
    blendable: blendableOf(nouns),
    crossAdjectives: otherThemes.flatMap((other) => themed[other]),
    crossNouns,
    crossBlendable: blendableOf(crossNouns),
  };
};

const crossing = (pools: Pools) =>
  pools.crossNouns.length > 0 && chance(CROSS_THEME_CHANCE);

const pickNoun = (pools: Pools) => {
  if (crossing(pools)) return pick(pools.crossNouns);
  return chance(PROJECT_NOUN_CHANCE) || pools.animals.length === 0
    ? pick(pools.nouns)
    : pick(pools.animals);
};

const pickStem = (pools: Pools) =>
  crossing(pools) ? pick(pools.crossNouns) : pick(pools.nouns);

const pickBlendable = (pools: Pools) =>
  crossing(pools) ? pick(pools.crossBlendable) : pick(pools.blendable);

const pickAdjective = (pools: Pools) =>
  crossing(pools) && pools.crossAdjectives.length > 0
    ? pick(pools.crossAdjectives)
    : pick(pools.adjectives);

const pickModifier = (pools: Pools) =>
  crossing(pools) && pools.crossAdjectives.length > 0
    ? pick(pools.crossAdjectives)
    : pick(pools.modifiers);

type Coined = { word: string; sources: string[] };

const coinedWord = (pools: Pools, window: LengthWindow): Coined | undefined => {
  if (chance(SUFFIX_SHARE)) {
    const stem = pickStem(pools);
    const word = suffixed(stem, pick(BRAND_SUFFIXES), window);
    return word ? { word, sources: [stem] } : undefined;
  }

  const first = pickBlendable(pools);
  const second = pickBlendable(pools);
  const word = first === second ? undefined : blend(first, second, window);
  return word ? { word, sources: [first, second] } : undefined;
};

const coinedCandidate = (
  { word, sources }: Coined,
  window: LengthWindow,
): Candidate => ({ parts: [word], sources, alliterative: false, window });

const hybridWindow = (length: NameLength) =>
  COINED_WINDOWS[length === "long" ? "medium" : "short"];

const tripleParts = (pools: Pools): string[] => {
  switch (randomIndex(3)) {
    case 0:
      return [pickAdjective(pools), pick(COLORS), pickNoun(pools)];
    case 1:
      return [pickAdjective(pools), pickNoun(pools), pick(TECH_TAILS)];
    default:
      return [pick(COLORS), pickNoun(pools), pick(TECH_TAILS)];
  }
};

const projectCandidate = (
  { style, length }: GenerateOptions,
  pools: Pools,
): Candidate | undefined => {
  const window = PROJECT_WINDOWS[length];
  const tripleWindow = TRIPLE_WINDOWS[length];
  const coinedWindow = COINED_WINDOWS[length];

  switch (pickWeighted(RECIPE_WEIGHTS[style])) {
    case "compound": {
      const cross = crossing(pools);
      return compound(
        cross && pools.crossAdjectives.length > 0
          ? pools.crossAdjectives
          : pools.modifiers,
        cross
          ? pools.crossNouns
          : chance(PROJECT_NOUN_CHANCE) || pools.animals.length === 0
            ? pools.nouns
            : pools.animals,
        PROJECT_ALLITERATION_CHANCE,
        window,
      );
    }
    case "techCompound":
      return assemble([pickStem(pools), pick(TECH_TAILS)], window);
    case "triple":
      return assemble(tripleParts(pools), tripleWindow);
    case "suffix": {
      const stem = pickStem(pools);
      const word = suffixed(stem, pick(BRAND_SUFFIXES), coinedWindow);
      return word
        ? coinedCandidate({ word, sources: [stem] }, coinedWindow)
        : undefined;
    }
    case "blend": {
      const first = pickBlendable(pools);
      const second = pickBlendable(pools);
      const word =
        first === second ? undefined : blend(first, second, coinedWindow);
      return word
        ? coinedCandidate({ word, sources: [first, second] }, coinedWindow)
        : undefined;
    }
    case "hybridPair": {
      const made = coinedWord(pools, hybridWindow(length));
      if (!made) return undefined;
      const parts = chance(KEYWORD_FIRST_CHANCE)
        ? [pickModifier(pools), made.word]
        : [made.word, pick(TECH_TAILS)];
      return assemble(parts, window, [...parts, ...made.sources]);
    }
    case "hybridTriple": {
      const made = coinedWord(pools, hybridWindow(length));
      if (!made) return undefined;
      const parts = [pickModifier(pools), made.word, pick(TECH_TAILS)];
      return assemble(parts, tripleWindow, [...parts, ...made.sources]);
    }
  }
};

const usernameCandidate = (
  { length }: GenerateOptions,
  pools: Pools,
): Candidate | undefined =>
  compound(
    pools.modifiers,
    chance(USERNAME_ANIMAL_CHANCE) && pools.animals.length > 0
      ? pools.animals
      : pools.nouns,
    USERNAME_ALLITERATION_CHANCE,
    USERNAME_WINDOWS[length],
  );

const withKeyword = (parts: string[], keyword: string) =>
  parts.filter((part) => part !== keyword);

const keywordProjectCandidate = (
  { style, length }: GenerateOptions,
  pools: Pools,
  keyword: string,
): Candidate | undefined => {
  const window = aroundKeyword(PROJECT_WINDOWS[length], keyword);
  const tripleWindow = aroundKeyword(TRIPLE_WINDOWS[length], keyword, 2);
  const coinedWindow = aroundKeyword(COINED_WINDOWS[length], keyword);
  const recipe = pickWeighted(RECIPE_WEIGHTS[style]);
  const coinable = keyword.length >= MIN_BLEND_PART_LETTERS;
  const needsCoining =
    recipe === "suffix" ||
    recipe === "blend" ||
    recipe === "hybridPair" ||
    recipe === "hybridTriple";
  const effective: ProjectRecipe =
    coinable || !needsCoining
      ? recipe
      : chance(KEYWORD_FIRST_CHANCE)
        ? "compound"
        : "techCompound";

  switch (effective) {
    case "compound": {
      const parts = chance(KEYWORD_MODIFIER_CHANCE)
        ? [pickModifier(pools), keyword]
        : [keyword, pickStem(pools)];
      return assemble(parts, window, withKeyword(parts, keyword));
    }
    case "techCompound": {
      const parts = [keyword, pick(TECH_TAILS)];
      return assemble(parts, window, withKeyword(parts, keyword));
    }
    case "triple": {
      const parts = chance(KEYWORD_FIRST_CHANCE)
        ? [pickModifier(pools), keyword, pick(TECH_TAILS)]
        : [keyword, pickNoun(pools), pick(TECH_TAILS)];
      return assemble(parts, tripleWindow, withKeyword(parts, keyword));
    }
    case "suffix": {
      const word = suffixed(keyword, pick(BRAND_SUFFIXES), coinedWindow);
      return word
        ? coinedCandidate({ word, sources: [] }, coinedWindow)
        : undefined;
    }
    case "blend": {
      const noun = pickBlendable(pools);
      const word = blendKeyword(
        keyword,
        noun,
        coinedWindow,
        chance(KEYWORD_FIRST_CHANCE),
      );
      return word
        ? coinedCandidate({ word, sources: [noun] }, coinedWindow)
        : undefined;
    }
    case "hybridPair": {
      const word = suffixed(
        keyword,
        pick(BRAND_SUFFIXES),
        hybridWindow(length),
      );
      if (!word) return undefined;
      const parts = chance(KEYWORD_FIRST_CHANCE)
        ? [pickModifier(pools), word]
        : [word, pick(TECH_TAILS)];
      return assemble(parts, window, parts);
    }
    case "hybridTriple": {
      const word = suffixed(
        keyword,
        pick(BRAND_SUFFIXES),
        hybridWindow(length),
      );
      if (!word) return undefined;
      const parts = [pickModifier(pools), word, pick(TECH_TAILS)];
      return assemble(parts, tripleWindow, parts);
    }
  }
};

const keywordUsernameCandidate = (
  { length }: GenerateOptions,
  pools: Pools,
  keyword: string,
): Candidate | undefined => {
  const window = aroundKeyword(USERNAME_WINDOWS[length], keyword);
  const parts = chance(KEYWORD_MODIFIER_CHANCE)
    ? [pick(pools.modifiers), keyword]
    : [
        keyword,
        chance(USERNAME_ANIMAL_CHANCE) && pools.animals.length > 0
          ? pick(pools.animals)
          : pick(pools.nouns),
      ];
  return assemble(parts, window, withKeyword(parts, keyword));
};

const nextCandidate = (options: GenerateOptions, pools: Pools) => {
  if (options.keyword === undefined) {
    return options.mode === "project"
      ? projectCandidate(options, pools)
      : usernameCandidate(options, pools);
  }
  return options.mode === "project"
    ? keywordProjectCandidate(options, pools, options.keyword)
    : keywordUsernameCandidate(options, pools, options.keyword);
};

const scoreCandidate = ({ parts, alliterative, window }: Candidate) => {
  const letters = parts.join("");
  const center = (window.minLetters + window.maxLetters) / 2;
  const reach = (window.maxLetters - window.minLetters) / 2 + 1;
  const lengthScore =
    1 - Math.min(1, Math.abs(letters.length - center) / reach);
  const syllableScore =
    1 -
    Math.min(1, Math.abs(totalSyllables(parts) - window.idealSyllables) / 3);
  const vowels = letters.match(/[aeiouy]/g)?.length ?? 0;
  const doubles = letters.match(/([a-z])\1/g)?.length ?? 0;
  const balanceScore = Math.max(
    0,
    1 -
      Math.min(1, Math.abs(vowels / letters.length - IDEAL_VOWEL_RATIO) * 3) -
      doubles * DOUBLE_LETTER_PENALTY,
  );

  return (
    SCORE_WEIGHTS.length * lengthScore +
    SCORE_WEIGHTS.syllables * syllableScore +
    SCORE_WEIGHTS.balance * balanceScore +
    SCORE_WEIGHTS.alliteration * (alliterative ? 1 : 0) +
    SCORE_WEIGHTS.jitter * nextRandom()
  );
};

const collectBatch = (options: GenerateOptions): GeneratedName[] => {
  const pools = poolsFor(options);
  const pool: { candidate: Candidate; score: number }[] = [];
  const seen = new Set<string>();

  for (
    let attempt = 0;
    attempt < MAX_ATTEMPTS && pool.length < POOL_SIZE;
    attempt++
  ) {
    const candidate = nextCandidate(options, pools);
    if (!candidate) continue;

    const key = candidate.parts.join("");
    if (seen.has(key)) continue;

    seen.add(key);
    pool.push({ candidate, score: scoreCandidate(candidate) });
  }

  pool.sort((left, right) => right.score - left.score);

  const names: GeneratedName[] = [];
  const used = new Set<string>();
  let alliterative = 0;

  for (const { candidate } of pool) {
    if (names.length >= BATCH_SIZE) break;
    if (candidate.sources.some((source) => used.has(source))) continue;
    if (candidate.alliterative) {
      if (alliterative >= MAX_ALLITERATIVE_PER_BATCH) continue;
      alliterative += 1;
    }

    candidate.sources.forEach((source) => used.add(source));
    names.push({
      id: `${candidate.parts.join("")}-${names.length}`,
      parts: candidate.parts,
      number: randomIndex(10000),
    });
  }

  return names;
};

export const generateBatch = (
  options: GenerateOptions,
  seed: string,
): GeneratedName[] => {
  nextRandom = createRandom(seed);
  try {
    return collectBatch(options);
  } finally {
    nextRandom = Math.random;
  }
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
