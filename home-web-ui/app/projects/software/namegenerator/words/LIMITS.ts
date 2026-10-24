import { NameLength } from "@/app/projects/software/namegenerator/words/types";

export type LengthWindow = {
  minLetters: number;
  maxLetters: number;
  maxSyllables: number;
  idealSyllables: number;
};

export const BATCH_SIZE = 12;
export const POOL_SIZE = BATCH_SIZE * 4;
export const MAX_ATTEMPTS = POOL_SIZE * 40;
export const MIN_BLEND_PART_LETTERS = 3;
export const MIN_MASHUP_PART_LETTERS = 2;
export const MAX_ALLITERATIVE_PER_BATCH = 4;
export const MIN_ROOT_OVERLAP = 3;
export const SEAM_LETTERS = 3;
export const MIN_KEYWORD_LETTERS = 2;
export const MAX_KEYWORD_LETTERS = 12;
export const KEYWORD_WINDOW_SLACK = 4;
export const MIN_PARTNER_LETTERS = 3;
export const MAX_PINS = 2;
export const REQUIRED_RETRIES = 3;

export const PROJECT_WINDOWS: Record<NameLength, LengthWindow> = {
  short: { minLetters: 4, maxLetters: 9, maxSyllables: 3, idealSyllables: 2 },
  medium: { minLetters: 7, maxLetters: 13, maxSyllables: 4, idealSyllables: 3 },
  long: { minLetters: 11, maxLetters: 17, maxSyllables: 6, idealSyllables: 4 },
};

export const TRIPLE_WINDOWS: Record<NameLength, LengthWindow> = {
  short: { minLetters: 8, maxLetters: 12, maxSyllables: 4, idealSyllables: 3 },
  medium: {
    minLetters: 11,
    maxLetters: 17,
    maxSyllables: 5,
    idealSyllables: 4,
  },
  long: { minLetters: 15, maxLetters: 22, maxSyllables: 7, idealSyllables: 5 },
};

export const COINED_WINDOWS: Record<NameLength, LengthWindow> = {
  short: { minLetters: 5, maxLetters: 7, maxSyllables: 2, idealSyllables: 2 },
  medium: { minLetters: 6, maxLetters: 9, maxSyllables: 3, idealSyllables: 3 },
  long: { minLetters: 8, maxLetters: 11, maxSyllables: 4, idealSyllables: 3 },
};

export const USERNAME_WINDOWS: Record<NameLength, LengthWindow> = {
  short: { minLetters: 5, maxLetters: 10, maxSyllables: 3, idealSyllables: 3 },
  medium: { minLetters: 8, maxLetters: 15, maxSyllables: 5, idealSyllables: 4 },
  long: { minLetters: 12, maxLetters: 20, maxSyllables: 7, idealSyllables: 5 },
};
