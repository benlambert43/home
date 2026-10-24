const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 8;

const usable = (word: string) =>
  /^[a-z]+$/.test(word) &&
  word.length >= MIN_WORD_LENGTH &&
  word.length <= MAX_WORD_LENGTH;

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
