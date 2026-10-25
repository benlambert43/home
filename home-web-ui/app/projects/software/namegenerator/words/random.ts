const SEED_WORDS = 4;
const HEX_DIGITS_PER_WORD = 8;
const SEED_PATTERN = /^[0-9a-f]{32}$/;
const WARM_UP_ROUNDS = 15;

const randomWords = () => {
  const words = new Uint32Array(SEED_WORDS);

  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    crypto.getRandomValues(words);
  } else {
    words.forEach((_, index) => {
      words[index] = Math.floor(Math.random() * 0x100000000);
    });
  }

  return words;
};

export const randomSeed = () =>
  Array.from(randomWords(), (word) =>
    word.toString(16).padStart(HEX_DIGITS_PER_WORD, "0"),
  ).join("");

export const decodeSeed = (value: string) =>
  SEED_PATTERN.test(value) ? value : undefined;

export const createRandom = (seed: string) => {
  const words = Array.from({ length: SEED_WORDS }, (_, index) => {
    const start = index * HEX_DIGITS_PER_WORD;
    return parseInt(seed.slice(start, start + HEX_DIGITS_PER_WORD), 16) >>> 0;
  });
  let [a, b, c, d] = words;

  const next = () => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };

  for (let round = 0; round < WARM_UP_ROUNDS; round++) next();

  return next;
};
