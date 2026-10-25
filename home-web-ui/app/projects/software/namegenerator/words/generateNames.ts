import {
  PROJECT_ADJECTIVES,
  PROJECT_ADJECTIVES_BY_THEME,
  USERNAME_ADJECTIVES,
  USERNAME_ADJECTIVES_BY_THEME,
} from "@/app/projects/software/namegenerator/words/ADJECTIVES";
import { ANIMALS } from "@/app/projects/software/namegenerator/words/ANIMALS";
import {
  BRAND_SUFFIXES,
  EXCLUDED_ENDINGS,
} from "@/app/projects/software/namegenerator/words/BRAND_SUFFIXES";
import {
  CLIMBING_CHANCE,
  COLOR_MODIFIER_SHARE,
  CONCRETE_MODIFIER_CHANCE,
  KEYWORD_FIRST_CHANCE,
  LANDMARK_CHANCE,
  MASHUP_CHANCE,
  PROJECT_ALLITERATION_CHANCE,
  PROJECT_NOUN_CHANCE,
  SUFFIX_SHARE,
  SUGGESTION_CHANCE,
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
  MAX_COLORS_PER_BATCH,
  LENGTH_STOCK_ATTEMPTS,
  MAX_ATTEMPTS,
  MAX_CONCRETE_SYLLABLES,
  MAX_KEYWORD_LETTERS,
  MAX_PINS,
  MIN_BLEND_PART_LETTERS,
  MIN_KEYWORD_LETTERS,
  MIN_MASHUP_PART_LETTERS,
  MIN_PARTNER_LETTERS,
  MIN_ROOT_OVERLAP,
  NAME_LENGTHS,
  POOL_SIZE,
  PROJECT_WINDOWS,
  REQUIRED_RETRIES,
  SEAM_LETTERS,
  SHELF_DEPTH,
  TRIPLE_WINDOWS,
  USERNAME_WINDOWS,
} from "@/app/projects/software/namegenerator/words/LIMITS";
import {
  CLIMBING,
  LANDMARKS,
  NOUNS,
  NOUNS_BY_THEME,
  THEME_NAMES,
} from "@/app/projects/software/namegenerator/words/NOUNS";
import { ONSETS } from "@/app/projects/software/namegenerator/words/ONSETS";
import { createRandom } from "@/app/projects/software/namegenerator/words/random";
import {
  OFF_TECH_TAIL_WEIGHT,
  RECIPE_WEIGHTS,
  USERNAME_RECIPE_WEIGHTS,
} from "@/app/projects/software/namegenerator/words/RECIPE_WEIGHTS";
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
  concreteNouns: string[];
  nouns: string[];
  animals: string[];
  blendable: string[];
  crossAdjectives: string[];
  crossNouns: string[];
  crossBlendable: string[];
  themeWords: Set<string>;
  foreignWords: Set<string>;
  mashups: Map<string, string[]>;
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

const CONCRETE_WORDS = new Set([
  ...NOUNS,
  ...COLORS,
  ...TECH_TAILS,
  ...ANIMALS,
]);

const allowedEnding = (word: string) =>
  !EXCLUDED_ENDINGS.some((ending) => word.endsWith(ending));

const coined = (word: string, sources: string[], window: LengthWindow) =>
  fits([word], window) &&
  allowedEnding(word) &&
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

const vowelRuns = (word: string) => [...word.matchAll(/[aeiouy]+/g)];

const partSized = (part: string, word: string) =>
  part.length >= MIN_MASHUP_PART_LETTERS && part.length < word.length;

const headsOf = (word: string) => {
  const [first] = vowelRuns(word);
  if (first === undefined) return [];
  const toVowel = word.slice(0, (first.index ?? 0) + first[0].length);
  const cluster = word.slice(toVowel.length).match(/^[^aeiouy]+/)?.[0] ?? "";
  return [...new Set([toVowel, toVowel + cluster])].filter((head) =>
    partSized(head, word),
  );
};

const tailsOf = (word: string) =>
  [
    ...new Set(
      vowelRuns(word)
        .slice(-2)
        .flatMap((run) => {
          const fromVowel = word.slice(run.index ?? 0);
          const cluster =
            word.slice(0, run.index ?? 0).match(/[^aeiouy]+$/)?.[0] ?? "";
          return [fromVowel, cluster + fromVowel];
        }),
    ),
  ].filter((tail) => partSized(tail, word));

const mashupsOf = (first: string, second: string) => {
  const joins = [
    ...headsOf(first).flatMap((head) =>
      tailsOf(second).map((tail) => [head, tail]),
    ),
    ...headsOf(second).flatMap((head) =>
      tailsOf(first).map((tail) => [head, tail]),
    ),
  ]
    .filter(
      ([head, tail]) =>
        head[head.length - 1] !== tail[0] && smoothJunction(head, tail),
    )
    .map(([head, tail]) => head + tail);

  return [...new Set(joins)].filter(
    (word) =>
      word !== first &&
      word !== second &&
      syllableCount(word) >= 2 &&
      !NOUN_WORDS.has(word) &&
      allowedEnding(word) &&
      clean(word),
  );
};

const orderlessKey = (parts: readonly string[]) => [...parts].sort().join("+");

const subsetsOf = (words: readonly string[], size: number): string[][] => {
  if (size === 0) return [[]];
  return words.flatMap((word, index) =>
    subsetsOf(words.slice(index + 1), size - 1).map((rest) => [word, ...rest]),
  );
};

const blendableOf = (nouns: readonly string[]) =>
  nouns.filter((noun) => syllables(noun).length >= 2);

const mashupsBy = (required: readonly string[]) =>
  new Map(
    subsetsOf(required, 2).map((pair) => [
      orderlessKey(pair),
      mashupsOf(pair[0], pair[1]),
    ]),
  );

const poolsFor = (
  { mode, style, theme: chosen }: GenerateOptions,
  theme: ThemeName,
  mashups: Map<string, string[]>,
): Pools => {
  const general = mode === "project" ? PROJECT_ADJECTIVES : USERNAME_ADJECTIVES;
  const themed =
    mode === "project"
      ? PROJECT_ADJECTIVES_BY_THEME
      : USERNAME_ADJECTIVES_BY_THEME;
  const nouns = NOUNS_BY_THEME[theme];
  const adjectives = [...new Set([...general, ...themed[theme]])];
  const crossing = mode === "project" && style === "any" && chosen !== "any";
  const otherThemes = crossing
    ? THEME_NAMES.filter((other) => other !== theme)
    : [];
  const crossNouns = [
    ...otherThemes.flatMap((other) => NOUNS_BY_THEME[other]),
    ...(crossing && theme !== "nature" ? ANIMALS : []),
  ];
  const crossAdjectives = otherThemes.flatMap((other) => themed[other]);
  const modifiers = [...new Set([...adjectives, ...COLORS])];
  const concreteNouns =
    mode === "project" && style === "any"
      ? nouns.filter((noun) => syllableCount(noun) <= MAX_CONCRETE_SYLLABLES)
      : [];
  const animals = theme === "nature" ? ANIMALS : [];
  const themeWords = new Set(
    crossing
      ? [...USERNAME_ADJECTIVES_BY_THEME[theme], ...nouns, ...animals]
      : [],
  );
  const native = new Set([...modifiers, ...nouns, ...animals]);

  return {
    adjectives,
    modifiers,
    concreteNouns,
    nouns,
    animals,
    blendable: blendableOf(nouns),
    crossAdjectives,
    crossNouns,
    crossBlendable: blendableOf(crossNouns),
    themeWords,
    foreignWords: new Set(
      [...crossAdjectives, ...crossNouns].filter((word) => !native.has(word)),
    ),
    mashups,
  };
};

const crossing = (pools: Pools) =>
  pools.crossNouns.length > 0 && !chance(SUGGESTION_CHANCE);

const anchored = (pools: Pools, { sources }: Candidate) =>
  !sources.some((source) => pools.foreignWords.has(source)) ||
  sources.some((source) => pools.themeWords.has(source));

const occasionalOr = (words: readonly string[]) => {
  if (chance(CLIMBING_CHANCE)) return CLIMBING;
  return chance(LANDMARK_CHANCE) ? LANDMARKS : words;
};

const pickNoun = (pools: Pools) => {
  if (crossing(pools)) return pick(pools.crossNouns);
  return pick(
    occasionalOr(
      chance(PROJECT_NOUN_CHANCE) || pools.animals.length === 0
        ? pools.nouns
        : pools.animals,
    ),
  );
};

const pickUsernameNoun = (pools: Pools) =>
  pick(
    occasionalOr(
      chance(USERNAME_ANIMAL_CHANCE) && pools.animals.length > 0
        ? pools.animals
        : pools.nouns,
    ),
  );

const pickStem = (pools: Pools) =>
  crossing(pools) ? pick(pools.crossNouns) : pick(occasionalOr(pools.nouns));

const pickBlendable = (pools: Pools) =>
  crossing(pools) ? pick(pools.crossBlendable) : pick(pools.blendable);

const plainModifiers = (pools: Pools) => {
  if (pools.concreteNouns.length === 0 || !chance(CONCRETE_MODIFIER_CHANCE)) {
    return pools.modifiers;
  }
  return chance(COLOR_MODIFIER_SHARE) ? COLORS : pools.concreteNouns;
};

const pickModifier = (pools: Pools) =>
  crossing(pools) && pools.crossAdjectives.length > 0
    ? pick(pools.crossAdjectives)
    : pick(plainModifiers(pools));

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

type Resolved = GenerateOptions & { length: NameLength; theme: ThemeName };

const loose = ({ mode, style }: GenerateOptions) =>
  mode === "project" && style === "any";

const resolveLength = (options: GenerateOptions): NameLength =>
  options.length === "any" || (loose(options) && !chance(SUGGESTION_CHANCE))
    ? pick(NAME_LENGTHS)
    : options.length;

const resolveTheme = ({ theme }: GenerateOptions): ThemeName =>
  theme === "any" ? pick(THEME_NAMES) : theme;

const resolve = (options: GenerateOptions): Resolved => ({
  ...options,
  length: resolveLength(options),
  theme: resolveTheme(options),
});

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

const HYBRID_TRIPLE_TEMPLATES: Slot[][] = [
  ["modifier", "coined", "tail"],
  ["modifier", "coined", "noun"],
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
      return pick(HYBRID_TRIPLE_TEMPLATES);
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

const mashupsFor = (
  template: Slot[],
  pools: Pools,
  length: NameLength,
  words: readonly string[],
) => {
  if (words.length !== 2 || !template.includes("coined")) return [];
  const window =
    template.length === 1 ? COINED_WINDOWS[length] : hybridWindow(length);
  return (pools.mashups.get(orderlessKey(words)) ?? []).filter((word) =>
    fits([word], window),
  );
};

const buildFromTemplate = (
  options: Resolved,
  pools: Pools,
  template: Slot[],
  required: readonly string[],
  recipe: ProjectRecipe,
): Candidate | undefined => {
  const { mode, length } = options;
  const mashups = mashupsFor(template, pools, length, required);

  if (template.length === 1 && template[0] === "coined") {
    if (mashups.length > 0) {
      const word = pick(mashups);
      return {
        parts: [word],
        sources: [word],
        alliterative: false,
        window: COINED_WINDOWS[length],
      };
    }
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
  const coinedAt = template.indexOf("coined");
  const mashing =
    mashups.length > 0 &&
    (required.length > realSlots.length || chance(MASHUP_CHANCE));
  const coining =
    !mashing &&
    coinedAt !== -1 &&
    required.length === 1 &&
    loose(options) &&
    chance(SUGGESTION_CHANCE);
  const placed = mashing || coining ? [] : required;
  if (placed.length > realSlots.length) return undefined;

  const parts: (string | undefined)[] = template.map(() => undefined);
  const sources: string[] = [];
  if (mashing) parts[coinedAt] = pick(mashups);
  if (coining) {
    const made = coinedFromWord(
      required[0],
      pools,
      hybridWindow(length),
      coinedRecipeFor(recipe),
    );
    if (!made) return undefined;
    parts[coinedAt] = made.word;
    sources.push(...made.sources);
  }
  const placements = shuffle(realSlots).slice(0, placed.length);
  shuffle(placed).forEach((word, index) => {
    parts[placements[index]] = word;
  });

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
  if (
    placed.length < required.length &&
    words.some((word) => required.includes(word))
  ) {
    return undefined;
  }
  const window = windowFor(mode, length, words.length, placed);
  return assemble(words, window, [
    ...words.filter((word) => !placed.includes(word)),
    ...sources,
  ]);
};

const capacityOf = (template: Slot[]) =>
  template.length === 1 && template[0] === "coined"
    ? 1
    : realSlotsOf(template).length;

const subsetChoices = (
  template: Slot[],
  pools: Pools,
  length: NameLength,
  required: readonly string[],
) => {
  if (required.length === 0) return [[[]]];
  const capacity = capacityOf(template);
  const viable = (subset: readonly string[]) =>
    subset.length <= capacity ||
    mashupsFor(template, pools, length, subset).length > 0;

  return Array.from({ length: required.length }, (_, index) =>
    subsetsOf(required, index + 1).filter(viable),
  ).filter((subsets) => subsets.length > 0);
};

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
  options: Resolved,
  pools: Pools,
  template: Slot[],
  recipe: ProjectRecipe,
  required: readonly string[],
  seen: ReadonlySet<string>,
): Picked | undefined => {
  const choices = subsetChoices(template, pools, options.length, required);
  if (choices.length === 0) return undefined;

  for (let retry = 0; retry < REQUIRED_RETRIES * choices.length; retry++) {
    const subset = pick(pick(choices));
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

  return undefined;
};

const projectCandidate = (
  resolved: Resolved,
  pools: Pools,
  required: readonly string[],
  seen: ReadonlySet<string>,
  weights: Record<ProjectRecipe, number>,
): Picked | undefined => {
  const recipe = pickWeighted(weights);

  if (recipe === "compound" && required.length === 0) {
    const cross = crossing(pools);
    const crossModifier =
      cross && pools.crossAdjectives.length > 0 && chance(SUGGESTION_CHANCE);
    return picked(
      recipe,
      [],
      compound(
        crossModifier ? pools.crossAdjectives : plainModifiers(pools),
        cross && !crossModifier
          ? pools.crossNouns
          : occasionalOr(
              chance(PROJECT_NOUN_CHANCE) || pools.animals.length === 0
                ? pools.nouns
                : pools.animals,
            ),
        PROJECT_ALLITERATION_CHANCE,
        PROJECT_WINDOWS[resolved.length],
      ),
    );
  }

  const coinable = required.every(
    (word) => word.length >= MIN_BLEND_PART_LETTERS,
  );
  const template = templateFor(recipe);

  return fitRequired(
    resolved,
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
  resolved: Resolved,
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
        occasionalOr(
          chance(USERNAME_ANIMAL_CHANCE) && pools.animals.length > 0
            ? pools.animals
            : pools.nouns,
        ),
        USERNAME_ALLITERATION_CHANCE,
        USERNAME_WINDOWS[resolved.length],
      ),
    );
  }
  return fitRequired(
    resolved,
    pools,
    ["modifier", "noun"],
    "compound",
    required,
    seen,
  );
};

const concreteScore = (parts: readonly string[]) => {
  const shortConcrete = parts.filter(
    (part) =>
      CONCRETE_WORDS.has(part) && syllableCount(part) <= MAX_CONCRETE_SYLLABLES,
  ).length;
  const crisp = syllableCount(parts[parts.length - 1]) === 1 ? 1 : 0;
  return (shortConcrete / parts.length + crisp) / 2;
};

const scoreCandidate = (
  { parts, alliterative, window }: Candidate,
  favorConcrete: boolean,
) => {
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
    (favorConcrete ? SCORE_WEIGHTS.concrete * concreteScore(parts) : 0) +
    SCORE_WEIGHTS.jitter * nextRandom()
  );
};

const requiredWords = ({ keyword, pins = [] }: GenerateOptions) =>
  [...new Set([keyword, ...pins].filter(isWord))].slice(0, MAX_PINS);

type Ranked = Picked & {
  length: NameLength;
  theme: ThemeName;
  score: number;
};

type Drawn = {
  lengths?: Map<NameLength, number>;
  themes: Map<ThemeName, number>;
};

type Shelves = Map<ProjectRecipe, Map<string, Ranked[]>>;

const shelve = (pool: readonly Ranked[], grouped: boolean): Shelves => {
  const shelves: Shelves = new Map();
  [...pool]
    .sort((left, right) => right.score - left.score)
    .forEach((entry) => {
      const key = grouped
        ? orderlessKey(entry.pinned)
        : entry.pinned.length > 0
          ? "pinned"
          : "";
      const byGroup = shelves.get(entry.recipe) ?? new Map<string, Ranked[]>();
      byGroup.set(key, [...(byGroup.get(key) ?? []), entry]);
      shelves.set(entry.recipe, byGroup);
    });
  return shelves;
};

const leastDrawn = <T>(
  values: readonly T[],
  counts: ReadonlyMap<T, number>,
) => {
  const fewest = Math.min(...values.map((value) => counts.get(value) ?? 0));
  return pick(values.filter((value) => (counts.get(value) ?? 0) === fewest));
};

const balancedEntry = (
  shelf: readonly Ranked[],
  { lengths, themes }: Drawn,
) => {
  const length =
    lengths &&
    leastDrawn([...new Set(shelf.map((entry) => entry.length))], lengths);
  const fitting = length
    ? shelf.filter((entry) => entry.length === length)
    : shelf;
  const theme = leastDrawn(
    [...new Set(fitting.map((entry) => entry.theme))],
    themes,
  );
  return fitting.find((entry) => entry.theme === theme);
};

const takeFromShelves = (
  shelves: Shelves,
  weights: Record<ProjectRecipe, number>,
  acceptable: (candidate: Candidate) => boolean,
  drawn: Drawn,
) => {
  const recipe = pickWeighted(
    Object.fromEntries(
      [...shelves.keys()].map((recipe) => [recipe, weights[recipe]]),
    ) as Record<ProjectRecipe, number>,
  );
  const byGroup = shelves.get(recipe);
  if (!byGroup) {
    shelves.delete(recipe);
    return undefined;
  }

  const key = pick([...byGroup.keys()]);
  const shelf = (byGroup.get(key) ?? []).filter((entry) =>
    acceptable(entry.candidate),
  );
  const entry = shelf.length > 0 ? balancedEntry(shelf, drawn) : undefined;
  const rest = shelf.filter((other) => other !== entry);
  if (rest.length === 0) byGroup.delete(key);
  else byGroup.set(key, rest);
  if (byGroup.size === 0) shelves.delete(recipe);
  return entry;
};

const COLOR_WORDS = new Set(COLORS);

const hasColor = ({ parts }: Candidate) =>
  parts.some((part) => COLOR_WORDS.has(part));

const techTailShare = (theme: GenerateOptions["theme"]) => {
  if (theme === "tech") return 1;
  if (theme !== "any") return OFF_TECH_TAIL_WEIGHT;
  return (
    (1 + OFF_TECH_TAIL_WEIGHT * (THEME_NAMES.length - 1)) / THEME_NAMES.length
  );
};

const weightsFor = ({ mode, style, theme }: GenerateOptions) => {
  if (mode === "username") return USERNAME_RECIPE_WEIGHTS;
  const weights = RECIPE_WEIGHTS[style];
  if (style !== "compound") return weights;
  return {
    ...weights,
    techCompound: weights.techCompound * techTailShare(theme),
  };
};

const stockKey = (recipe: ProjectRecipe, length?: NameLength) =>
  length ? `${recipe}/${length}` : recipe;

const quotasFor = (
  weights: Record<ProjectRecipe, number>,
  balancing: boolean,
) => {
  const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  const lengths = balancing ? NAME_LENGTHS : [undefined];
  return (Object.entries(weights) as [ProjectRecipe, number][]).flatMap(
    ([recipe, weight]) =>
      weight > 0
        ? lengths.map(
            (length) =>
              [
                stockKey(recipe, length),
                Math.ceil(
                  (Math.ceil((BATCH_SIZE * weight) / total) * SHELF_DEPTH) /
                    lengths.length,
                ),
              ] as const,
          )
        : [],
  );
};

const collectBatch = (options: GenerateOptions): GeneratedName[] => {
  const required = requiredWords(options);
  const mashups = mashupsBy(required);
  const poolsByTheme = new Map(
    (options.theme === "any" ? THEME_NAMES : [options.theme]).map((theme) => [
      theme,
      poolsFor(options, theme, mashups),
    ]),
  );
  const weights = weightsFor(options);
  const balancing = options.length === "any";
  const quotas = quotasFor(weights, false);
  const lengthQuotas = balancing ? quotasFor(weights, true) : [];
  const stocked = new Map<string, number>();
  const names: GeneratedName[] = [];
  const seen = new Set<string>();
  const used = new Set<string>();
  const pool: Ranked[] = [];
  const drawn: Drawn = {
    lengths: balancing ? new Map() : undefined,
    themes: new Map(),
  };
  let alliterations = 0;
  let colored = 0;
  const acceptable = (candidate: Candidate) =>
    !candidate.sources.some((source) => used.has(source)) &&
    (!candidate.alliterative || alliterations < MAX_ALLITERATIVE_PER_BATCH) &&
    (!hasColor(candidate) || colored < MAX_COLORS_PER_BATCH);
  const understocked = (goals: typeof quotas) =>
    goals.some(([stock, quota]) => (stocked.get(stock) ?? 0) < quota);

  for (
    let attempt = 0;
    attempt < MAX_ATTEMPTS &&
    (pool.length < POOL_SIZE ||
      understocked(quotas) ||
      (attempt < LENGTH_STOCK_ATTEMPTS && understocked(lengthQuotas)));
    attempt++
  ) {
    const resolved = resolve(options);
    const pools = poolsByTheme.get(resolved.theme);
    if (!pools) continue;
    const made =
      options.mode === "project"
        ? projectCandidate(resolved, pools, required, seen, weights)
        : usernameCandidate(resolved, pools, required, seen);
    if (!made || !anchored(pools, made.candidate)) continue;

    const key = orderlessKey(made.candidate.parts);
    if (seen.has(key)) continue;

    seen.add(key);
    [stockKey(made.recipe), stockKey(made.recipe, resolved.length)].forEach(
      (stock) => stocked.set(stock, (stocked.get(stock) ?? 0) + 1),
    );
    pool.push({
      ...made,
      length: resolved.length,
      theme: resolved.theme,
      score: scoreCandidate(made.candidate, loose(options)),
    });
  }

  const shelves = shelve(pool, !loose(options));

  for (
    let draw = 0;
    draw < MAX_ATTEMPTS && names.length < BATCH_SIZE && shelves.size > 0;
    draw++
  ) {
    const entry = takeFromShelves(shelves, weights, acceptable, drawn);
    if (!entry) continue;

    const { candidate, length, theme } = entry;
    if (candidate.alliterative) alliterations += 1;
    if (hasColor(candidate)) colored += 1;
    drawn.lengths?.set(length, (drawn.lengths.get(length) ?? 0) + 1);
    drawn.themes.set(theme, (drawn.themes.get(theme) ?? 0) + 1);

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
  { parts }: Pick<GeneratedName, "parts">,
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
  { parts, number }: Pick<GeneratedName, "parts" | "number">,
  { separator, digits, casing }: UsernameOptions,
) =>
  [
    ...(casing === "capital" ? parts.map(capitalize) : parts),
    ...digitsFor(number, digits),
  ].join(USERNAME_SEPARATORS[separator]);
