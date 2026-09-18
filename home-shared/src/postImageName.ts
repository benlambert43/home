import { MAX_POST_IMAGE_NAME_CHARACTERS, postImageContentType } from "./post";

const DEFAULT_POST_IMAGE_STEM = "image";

const DIACRITICS = /\p{Diacritic}/gu;

const DISALLOWED_CHARACTERS = /[^a-zA-Z0-9_-]+/g;

const LEADING_NON_ALPHANUMERIC = /^[^a-zA-Z0-9]+/;

const postImageStem = (stem: string) => {
  const allowed = stem
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(DISALLOWED_CHARACTERS, "-")
    .replace(LEADING_NON_ALPHANUMERIC, "");

  return allowed === "" ? DEFAULT_POST_IMAGE_STEM : allowed;
};

export const toPostImageName = (fileName: string): string | undefined => {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0 || !postImageContentType(fileName)) return undefined;

  const extension = `.${fileName.slice(dot + 1).toLowerCase()}`;
  const stem = postImageStem(fileName.slice(0, dot));

  return `${stem.slice(0, MAX_POST_IMAGE_NAME_CHARACTERS - extension.length)}${extension}`;
};

export const uniquePostImageName = (name: string, taken: string[]): string => {
  const used = new Set(taken.map((takenName) => takenName.toLowerCase()));
  if (!used.has(name.toLowerCase())) return name;

  const dot = name.lastIndexOf(".");
  const stem = name.slice(0, dot);
  const extension = name.slice(dot);

  const numbered = (copy: number) => {
    const suffix = `-${copy}${extension}`;

    return `${stem.slice(0, MAX_POST_IMAGE_NAME_CHARACTERS - suffix.length)}${suffix}`;
  };

  let copy = 2;
  while (used.has(numbered(copy).toLowerCase())) copy += 1;

  return numbered(copy);
};
