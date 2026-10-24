export const MAX_SEED = 0xffffffff;

export const randomSeed = () => Math.floor(Math.random() * (MAX_SEED + 1));

export const encodeSeed = (seed: number) => seed.toString(36);

export const decodeSeed = (value: string) => {
  const seed = /^[0-9a-z]{1,7}$/.test(value) ? parseInt(value, 36) : NaN;
  return Number.isInteger(seed) && seed >= 0 && seed <= MAX_SEED
    ? seed
    : undefined;
};

export const createRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};
