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
  MAX_PINS,
  MIN_BLEND_PART_LETTERS,
  MIN_KEYWORD_LETTERS,
  MIN_PARTNER_LETTERS,
  MIN_ROOT_OVERLAP,
  POOL_SIZE,
  PROJECT_WINDOWS,
  REQUIRED_RETRIES,
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
  Mode,
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
  sources: string[],
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
    alliterative: parts.length > 1 && parts[0][0] === parts[1][0],
    window,
  };
};

const shuffle = <T>(items: readonly T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = randomIndex(index + 1);
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
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
  const parts = [modifier, noun];
  return assemble(parts, window, parts);
};

const blendWord = (
  word: string,
  noun: string,
  window: LengthWindow,
  wordFirst: boolean,
) => {
  const wordSyllables = syllables(word);
  const nounSyllables = syllables(noun);
  if (nounSyllables.length < 2) return undefined;

  const wordHead = wordSyllables.length >= 2 ? wordSyllables[0] : word;
  const wordTail =
    wordSyllables.length >= 2 ? wordSyllables[wordSyllables.length - 1] : word;
  const start = wordFirst ? wordHead : nounSyllables[0];
  const end = wordFirst ? nounSyllables[nounSyllables.length - 1] : wordTail;

  if (
    start.length < MIN_BLEND_PART_LETTERS ||
    end.length < MIN_BLEND_PART_LETTERS ||
    !smoothJunction(start, end)
  ) {
    return undefined;
  }

  const made = start + end;
  return coined(made, [word, noun], window) ? made : undefined;
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

const pickUsernameNoun = (pools: Pools) =>
  chance(USERNAME_ANIMAL_CHANCE) && pools.animals.length > 0
    ? pick(pools.animals)
    : pick(pools.nouns);

const pickStem = (pools: Pools) =>
  crossing(pools) ? pick(pools.crossNouns) : pick(pools.nouns);

const pickBlendable = (pools: Pools) =>
  crossing(pools) ? pick(pools.crossBlendable) : pick(pools.blendable);

const pickModifier = (pools: Pools) =>
  crossing(pools) && pools.crossAdjectives.length > 0
    ? pick(pools.crossAdjectives)
    : pick(pools.modifiers);

type Coined = { word: string; sources: string[] };

type CoinedRecipe = "suffix" | "blend" | "either";

const coinWithSuffix = (recipe: CoinedRecipe) =>
  recipe === "suffix" || (recipe === "either" && chance(SUFFIX_SHARE));

const coinedWord = (
  pools: Pools,
  window: LengthWindow,
  recipe: CoinedRecipe,
): Coined | undefined => {
  if (coinWithSuffix(recipe)) {
    const stem = pickStem(pools);
    const word = suffixed(stem, pick(BRAND_SUFFIXES), window);
    return word ? { word, sources: [stem] } : undefined;
  }

  const first = pickBlendable(pools);
  const second = pickBlendable(pools);
  const word = first === second ? undefined : blend(first, second, window);
  return word ? { word, sources: [first, second] } : undefined;
};

const coinedFromWord = (
  base: string,
  pools: Pools,
  window: LengthWindow,
  recipe: CoinedRecipe,
): Coined | undefined => {
  if (base.length < MIN_BLEND_PART_LETTERS) return undefined;

  if (coinWithSuffix(recipe)) {
    const word = suffixed(base, pick(BRAND_SUFFIXES), window);
    return word ? { word, sources: [] } : undefined;
  }

  const noun = pickBlendable(pools);
  const word = blendWord(base, noun, window, chance(KEYWORD_FIRST_CHANCE));
  return word ? { word, sources: [noun] } : undefined;
};

const hybridWindow = (length: NameLength) =>
  COINED_WINDOWS[length === "long" ? "medium" : "short"];

type Slot = "modifier" | "color" | "noun" | "stem" | "tail" | "coined";

const PAIR_TEMPLATES: Slot[][] = [
  ["modifier", "noun"],
  ["stem", "tail"],
];

const TRIPLE_TEMPLATES: Slot[][] = [
  ["modifier", "color", "noun"],
  ["modifier", "noun", "tail"],
  ["color", "noun", "tail"],
];

const templateFor = (recipe: ProjectRecipe): Slot[] => {
  switch (recipe) {
    case "compound":
      return ["modifier", "noun"];
    case "techCompound":
      return ["stem", "tail"];
    case "triple":
      return pick(TRIPLE_TEMPLATES);
    case "suffix":
    case "blend":
      return ["coined"];
    case "hybridPair":
      return chance(KEYWORD_FIRST_CHANCE)
        ? ["modifier", "coined"]
        : ["coined", "tail"];
    case "hybridTriple":
      return ["modifier", "coined", "tail"];
  }
};

const coinedRecipeFor = (recipe: ProjectRecipe): CoinedRecipe =>
  recipe === "suffix" ? "suffix" : recipe === "blend" ? "blend" : "either";

const realSlotsOf = (template: Slot[]) =>
  template.flatMap((slot, index) => (slot === "coined" ? [] : [index]));

const fillSlot = (slot: Exclude<Slot, "coined">, pools: Pools, mode: Mode) => {
  switch (slot) {
    case "modifier":
      return pickModifier(pools);
    case "color":
      return pick(COLORS);
    case "noun":
      return mode === "project" ? pickNoun(pools) : pickUsernameNoun(pools);
    case "stem":
      return pickStem(pools);
    case "tail":
      return pick(TECH_TAILS);
  }
};

const aroundWords = (
  window: LengthWindow,
  words: readonly string[],
  partners: number,
): LengthWindow => {
  if (words.length === 0) return window;
  const letters = words.join("").length;
  const spoken = words.reduce((total, word) => total + syllableCount(word), 0);

  return {
    minLetters: Math.min(
      window.minLetters,
      letters + MIN_PARTNER_LETTERS * partners,
    ),
    maxLetters: Math.max(
      window.maxLetters,
      letters + KEYWORD_WINDOW_SLACK * partners,
    ),
    maxSyllables: Math.max(window.maxSyllables, spoken + partners),
    idealSyllables: Math.max(window.idealSyllables, spoken + partners),
  };
};

const windowFor = (
  mode: Mode,
  length: NameLength,
  parts: number,
  required: readonly string[],
) => {
  const base =
    mode === "username"
      ? USERNAME_WINDOWS[length]
      : parts === 1
        ? COINED_WINDOWS[length]
        : parts === 2
          ? PROJECT_WINDOWS[length]
          : TRIPLE_WINDOWS[length];
  return aroundWords(base, required, parts - required.length);
};

const isWord = (part: string | undefined): part is string => part !== undefined;

const buildFromTemplate = (
  { mode, length }: GenerateOptions,
  pools: Pools,
  template: Slot[],
  required: readonly string[],
  recipe: ProjectRecipe,
): Candidate | undefined => {
  if (template.length === 1 && template[0] === "coined") {
    if (required.length > 1) return undefined;
    const window = windowFor(mode, length, 1, required);
    const made =
      required.length === 1
        ? coinedFromWord(required[0], pools, window, coinedRecipeFor(recipe))
        : coinedWord(pools, window, coinedRecipeFor(recipe));
    return made
      ? {
          parts: [made.word],
          sources: made.sources,
          alliterative: false,
          window,
        }
      : undefined;
  }

  const realSlots = realSlotsOf(template);
  if (required.length > realSlots.length) return undefined;

  const parts: (string | undefined)[] = template.map(() => undefined);
  const placements = shuffle(realSlots).slice(0, required.length);
  shuffle(required).forEach((word, index) => {
    parts[placements[index]] = word;
  });

  const sources: string[] = [];
  for (let index = 0; index < template.length; index++) {
    if (parts[index] !== undefined) continue;
    const slot = template[index];

    if (slot === "coined") {
      const made = coinedWord(
        pools,
        hybridWindow(length),
        coinedRecipeFor(recipe),
      );
      if (!made) return undefined;
      parts[index] = made.word;
      sources.push(...made.sources);
    } else {
      parts[index] = fillSlot(slot, pools, mode);
    }
  }

  const words = parts.filter(isWord);
  const window = windowFor(mode, length, words.length, required);
  return assemble(words, window, [
    ...words.filter((word) => !required.includes(word)),
    ...sources,
  ]);
};

const orderlessKey = (parts: readonly string[]) => [...parts].sort().join("+");

const capacityOf = (template: Slot[]) =>
  template.length === 1 && template[0] === "coined"
    ? 1
    : realSlotsOf(template).length;

type Picked = {
  candidate: Candidate;
  recipe: ProjectRecipe;
  pinned: readonly string[];
};

const picked = (
  recipe: ProjectRecipe,
  pinned: readonly string[],
  candidate: Candidate | undefined,
): Picked | undefined => candidate && { candidate, recipe, pinned };

const fitRequired = (
  options: GenerateOptions,
  pools: Pools,
  template: Slot[],
  recipe: ProjectRecipe,
  required: readonly string[],
  seen: ReadonlySet<string>,
): Picked | undefined => {
  const most = Math.min(capacityOf(template), required.length);
  const least = Math.min(1, required.length);

  for (let size = most; size >= least; size--) {
    for (let retry = 0; retry < REQUIRED_RETRIES; retry++) {
      const subset =
        size === required.length ? required : shuffle(required).slice(0, size);
      const candidate = buildFromTemplate(
        options,
        pools,
        template,
        subset,
        recipe,
      );
      if (!candidate) return undefined;
      if (!seen.has(orderlessKey(candidate.parts))) {
        return picked(recipe, subset, candidate);
      }
    }
  }

  return undefined;
};

const projectCandidate = (
  options: GenerateOptions,
  pools: Pools,
  required: readonly string[],
  seen: ReadonlySet<string>,
): Picked | undefined => {
  const recipe = pickWeighted(RECIPE_WEIGHTS[options.style]);

  if (recipe === "compound" && required.length === 0) {
    const cross = crossing(pools);
    return picked(
      recipe,
      [],
      compound(
        cross && pools.crossAdjectives.length > 0
          ? pools.crossAdjectives
          : pools.modifiers,
        cross
          ? pools.crossNouns
          : chance(PROJECT_NOUN_CHANCE) || pools.animals.length === 0
            ? pools.nouns
            : pools.animals,
        PROJECT_ALLITERATION_CHANCE,
        PROJECT_WINDOWS[options.length],
      ),
    );
  }

  const coinable = required.every(
    (word) => word.length >= MIN_BLEND_PART_LETTERS,
  );
  const template = templateFor(recipe);

  return fitRequired(
    options,
    pools,
    template[0] === "coined" && template.length === 1 && !coinable
      ? pick(PAIR_TEMPLATES)
      : template,
    recipe,
    required,
    seen,
  );
};

const usernameCandidate = (
  options: GenerateOptions,
  pools: Pools,
  required: readonly string[],
  seen: ReadonlySet<string>,
): Picked | undefined => {
  if (required.length === 0) {
    return picked(
      "compound",
      [],
      compound(
        pools.modifiers,
        chance(USERNAME_ANIMAL_CHANCE) && pools.animals.length > 0
          ? pools.animals
          : pools.nouns,
        USERNAME_ALLITERATION_CHANCE,
        USERNAME_WINDOWS[options.length],
      ),
    );
  }
  return fitRequired(
    options,
    pools,
    ["modifier", "noun"],
    "compound",
    required,
    seen,
  );
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

const requiredWords = ({ keyword, pins = [] }: GenerateOptions) =>
  [...new Set([keyword, ...pins].filter(isWord))].slice(0, MAX_PINS);

type Ranked = Picked & { score: number };

type Shelves = Map<string, Map<ProjectRecipe, Ranked[]>>;

const shelve = (pool: readonly Ranked[]): Shelves => {
  const shelves: Shelves = new Map();
  [...pool]
    .sort((left, right) => right.score - left.score)
    .forEach((entry) => {
      const key = orderlessKey(entry.pinned);
      const byRecipe = shelves.get(key) ?? new Map<ProjectRecipe, Ranked[]>();
      byRecipe.set(entry.recipe, [
        ...(byRecipe.get(entry.recipe) ?? []),
        entry,
      ]);
      shelves.set(key, byRecipe);
    });
  return shelves;
};

const takeFromShelves = (
  shelves: Shelves,
  weights: Record<ProjectRecipe, number>,
) => {
  const key = pick([...shelves.keys()]);
  const byRecipe = shelves.get(key);
  if (!byRecipe) {
    shelves.delete(key);
    return undefined;
  }

  const recipe = pickWeighted(
    Object.fromEntries(
      [...byRecipe.keys()].map((recipe) => [recipe, weights[recipe]]),
    ) as Record<ProjectRecipe, number>,
  );
  const shelf = byRecipe.get(recipe) ?? [];
  const entry = shelf.shift();
  if (shelf.length === 0) byRecipe.delete(recipe);
  if (byRecipe.size === 0) shelves.delete(key);
  return entry;
};

const collectBatch = (options: GenerateOptions): GeneratedName[] => {
  const pools = poolsFor(options);
  const required = requiredWords(options);
  const names: GeneratedName[] = [];
  const seen = new Set<string>();
  const used = new Set<string>();
  const pool: Ranked[] = [];
  let alliterative = 0;

  for (
    let attempt = 0;
    attempt < MAX_ATTEMPTS && pool.length < POOL_SIZE;
    attempt++
  ) {
    const made =
      options.mode === "project"
        ? projectCandidate(options, pools, required, seen)
        : usernameCandidate(options, pools, required, seen);
    if (!made) continue;

    const key = orderlessKey(made.candidate.parts);
    if (seen.has(key)) continue;

    seen.add(key);
    pool.push({ ...made, score: scoreCandidate(made.candidate) });
  }

  const shelves = shelve(pool);

  for (
    let draw = 0;
    draw < MAX_ATTEMPTS && names.length < BATCH_SIZE && shelves.size > 0;
    draw++
  ) {
    const entry = takeFromShelves(shelves, RECIPE_WEIGHTS[options.style]);
    if (!entry) continue;

    const { candidate } = entry;
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
