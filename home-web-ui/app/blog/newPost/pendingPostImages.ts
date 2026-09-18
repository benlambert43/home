import { PostMarkdownImage } from "@/app/blog/PostMarkdown";
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

export type PendingPostImages = {
  headerImage?: PendingPostImage;
  inlineImages: PendingPostImage[];
};

export type ReadImageFile = Omit<PendingPostImage, "previewUrl">;

export const NO_PENDING_IMAGES: PendingPostImages = { inlineImages: [] };

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

export const readImageFiles = async (files: File[]) => {
  const read: ReadImageFile[] = [];
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

    try {
      read.push({ name, file, ...(await imageSize(file)) });
    } catch {
      problems.push(unreadableProblem(file));
    }
  }

  return { read, problems };
};

export const allPendingImages = ({
  headerImage,
  inlineImages,
}: PendingPostImages) =>
  headerImage ? [headerImage, ...inlineImages] : inlineImages;

const pendingImage = (
  read: ReadImageFile,
  taken: PendingPostImage[],
): PendingPostImage => ({
  ...read,
  name: uniquePostImageName(
    read.name,
    taken.map((image) => image.name),
  ),
  previewUrl: URL.createObjectURL(read.file),
});

export const releasePendingImage = (image: PendingPostImage) => {
  URL.revokeObjectURL(image.previewUrl);
};

export const withHeaderImage = (
  pending: PendingPostImages,
  read: ReadImageFile,
): PendingPostImages => ({
  ...pending,
  headerImage: pendingImage(read, pending.inlineImages),
});

export const withInlineImages = (
  pending: PendingPostImages,
  read: ReadImageFile[],
) => {
  const room = MAX_POST_INLINE_IMAGES - pending.inlineImages.length;
  const added: PendingPostImage[] = [];

  for (const file of read.slice(0, room)) {
    added.push(pendingImage(file, [...allPendingImages(pending), ...added]));
  }

  return {
    pending: { ...pending, inlineImages: [...pending.inlineImages, ...added] },
    added,
    problems: read.length > room ? [TOO_MANY_IMAGES_PROBLEM] : [],
  };
};

export const withoutPendingImage = (
  pending: PendingPostImages,
  removed: PendingPostImage,
): PendingPostImages => ({
  headerImage:
    pending.headerImage === removed ? undefined : pending.headerImage,
  inlineImages: pending.inlineImages.filter((image) => image !== removed),
});

export const pendingMarkdownImages = (
  pending: PendingPostImages,
): PostMarkdownImage[] =>
  allPendingImages(pending).map((image) => ({
    reference: postImageReference(image.name),
    src: image.previewUrl,
    width: image.width,
    height: image.height,
  }));

const linkedUrls = (content: string) => {
  const urls: string[] = [];

  void markdown.walkTokens(markdown.lexer(content), (token) => {
    const known = token as MarkedToken;

    if (known.type === "image" || known.type === "link") urls.push(known.href);
  });

  return urls;
};

export const unmatchedImageReferences = (
  content: string,
  pending: PendingPostImages,
) => {
  const references = new Set(
    allPendingImages(pending).map((image) => postImageReference(image.name)),
  );

  const unmatched = linkedUrls(content).filter(
    (url) =>
      url.startsWith(POST_IMAGE_REFERENCE_PREFIX) && !references.has(url),
  );

  return [...new Set(unmatched)];
};
