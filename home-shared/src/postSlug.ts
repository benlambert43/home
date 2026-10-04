import { MAX_POST_SLUG_CHARACTERS } from "./post";

const FALLBACK_POST_SLUG = "post";

const MARKS = /\p{M}/gu;

const APOSTROPHES = /['’]/g;

const SEPARATORS = /[^a-z0-9]+/;

export const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_POST_SLUGS = ["newpost", "uploads"];

const slugWords = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(MARKS, "")
    .replace(APOSTROPHES, "")
    .split(SEPARATORS)
    .filter((word) => word !== "");

const joinedWithin = (
  [first = "", ...rest]: string[],
  maxCharacters: number,
) => {
  let slug = first.slice(0, maxCharacters);

  for (const word of rest) {
    const longer = `${slug}-${word}`;
    if (longer.length > maxCharacters) break;

    slug = longer;
  }

  return slug;
};

export const postSlug = (title: string, attempt = 1) => {
  const suffix = attempt > 1 ? `-${attempt}` : "";
  const base = joinedWithin(
    slugWords(title),
    MAX_POST_SLUG_CHARACTERS - suffix.length,
  );

  return `${base === "" ? FALLBACK_POST_SLUG : base}${suffix}`;
};
