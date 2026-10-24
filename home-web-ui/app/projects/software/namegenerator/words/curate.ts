import { afinn165 } from "afinn-165";

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 8;

const sentiment = (word: string): number | undefined => afinn165[word];

const pleasant = (word: string) => (sentiment(word) ?? 0) >= 0;

const usable = (word: string) =>
  /^[a-z]+$/.test(word) &&
  word.length >= MIN_WORD_LENGTH &&
  word.length <= MAX_WORD_LENGTH &&
  pleasant(word);

export const curate = (
  words: readonly string[],
  excluded: readonly string[] = [],
) => {
  const excludedWords = new Set(excluded);
  return [
    ...new Set(
      words.filter((word) => usable(word) && !excludedWords.has(word)),
    ),
  ];
};
