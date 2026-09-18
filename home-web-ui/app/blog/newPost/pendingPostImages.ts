import {
  MAX_POST_IMAGE_BYTES,
  MAX_POST_INLINE_IMAGES,
  POST_IMAGE_REFERENCE_PREFIX,
  postImageReference,
  toPostImageName,
  uniquePostImageName,
} from "@home/shared";
import { Marked, MarkedToken } from "marked";

const BYTES_PER_MEGABYTE = 1024 * 1024;

const TOO_MANY_IMAGES_PROBLEM = `A post may add at most ${MAX_POST_INLINE_IMAGES} images at a time.`;

const markdown = new Marked();

export type PendingPostImage = {
  name: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

export type AddedPendingImages = {
  images: PendingPostImage[];
  problems: string[];
};

const unsupportedProblem = (file: File) =>
  `${file.name} is not a PNG, JPEG, WebP, GIF, or AVIF image.`;

const tooLargeProblem = (file: File) =>
  `${file.name} is larger than ${MAX_POST_IMAGE_BYTES / BYTES_PER_MEGABYTE} MB.`;

const unreadableProblem = (file: File) =>
  `${file.name} could not be read as an image.`;

const imageSize = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  bitmap.close();

  return { width, height };
};

export const addPendingImages = async (
  current: PendingPostImage[],
  files: File[],
): Promise<AddedPendingImages> => {
  const images = [...current];
  const problems: string[] = [];

  for (const file of files) {
    const name = toPostImageName(file.name);

    if (name === undefined) {
      problems.push(unsupportedProblem(file));
      continue;
    }

    if (file.size > MAX_POST_IMAGE_BYTES) {
      problems.push(tooLargeProblem(file));
      continue;
    }

    if (images.length >= MAX_POST_INLINE_IMAGES) {
      problems.push(TOO_MANY_IMAGES_PROBLEM);
      break;
    }

    let size: { width: number; height: number };

    try {
      size = await imageSize(file);
    } catch {
      problems.push(unreadableProblem(file));
      continue;
    }

    images.push({
      name: uniquePostImageName(
        name,
        images.map((image) => image.name),
      ),
      file,
      previewUrl: URL.createObjectURL(file),
      ...size,
    });
  }

  return { images, problems };
};

const linkedUrls = (content: string) => {
  const urls: string[] = [];

  void markdown.walkTokens(markdown.lexer(content), (token) => {
    const known = token as MarkedToken;

    if (known.type === "image" || known.type === "link") urls.push(known.href);
  });

  return urls;
};

export const unmatchedImageReferences = (content: string, names: string[]) => {
  const references = new Set(names.map((name) => postImageReference(name)));

  const unmatched = linkedUrls(content).filter(
    (url) =>
      url.startsWith(POST_IMAGE_REFERENCE_PREFIX) && !references.has(url),
  );

  return [...new Set(unmatched)];
};
