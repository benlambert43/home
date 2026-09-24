import { postImageHref } from "@/app/blog/links";
import { PostMarkdownImage } from "@/app/blog/PostMarkdown";
import {
  MAX_POST_IMAGE_BYTES,
  MAX_POST_IMAGE_MEGABYTES,
  MAX_POST_INLINE_IMAGES,
  Post,
  PostImage,
  postImageReference,
  postImageReferences,
  toPostImageName,
  uniquePostImageName,
  UpdatePostRequestBody,
} from "@home/shared";

const TOO_MANY_IMAGES_PROBLEM = `A post may add at most ${MAX_POST_INLINE_IMAGES} images at a time.`;

type PostFormImageDetails = {
  name: string;
  src: string;
  byteSize: number;
  width: number;
  height: number;
};

export type PendingPostImage = PostFormImageDetails & {
  stored: false;
  file: File;
};

export type StoredPostImage = PostFormImageDetails & { stored: true };

export type PostFormImage = PendingPostImage | StoredPostImage;

export type PostFormImages = {
  headerImage?: PostFormImage;
  inlineImages: PostFormImage[];
  usedImageNames: string[];
  removedStoredImages: { headerImage?: string; inlineImages: string[] };
};

export type PostFormImageRemovals = Pick<
  UpdatePostRequestBody,
  "headerImage" | "removeInlineImages"
>;

export type ReadImageFile = Omit<PendingPostImage, "stored" | "src">;

export const NO_POST_FORM_IMAGES: PostFormImages = {
  inlineImages: [],
  usedImageNames: [],
  removedStoredImages: { inlineImages: [] },
};

const unsupportedProblem = (file: File) =>
  `${file.name} is not a PNG, JPEG, WebP, GIF, or AVIF image.`;

const tooLargeProblem = (file: File) =>
  `${file.name} is larger than ${MAX_POST_IMAGE_MEGABYTES} MB.`;

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
      read.push({
        name,
        file,
        byteSize: file.size,
        ...(await imageSize(file)),
      });
    } catch {
      problems.push(unreadableProblem(file));
    }
  }

  return { read, problems };
};

const storedImage = (
  postId: string,
  { name, byteSize, width, height }: PostImage,
): StoredPostImage => ({
  stored: true,
  name,
  src: postImageHref(postId, name),
  byteSize,
  width,
  height,
});

export const storedPostImages = ({
  post: { _id, headerImage, inlineImages },
  usedImageNames,
}: {
  post: Post;
  usedImageNames: string[];
}): PostFormImages => ({
  headerImage: headerImage ? storedImage(_id, headerImage) : undefined,
  inlineImages: inlineImages.map((image) => storedImage(_id, image)),
  usedImageNames,
  removedStoredImages: { inlineImages: [] },
});

export const allPostFormImages = <Image extends PostFormImage>({
  headerImage,
  inlineImages,
}: {
  headerImage?: Image;
  inlineImages: Image[];
}) => (headerImage ? [headerImage, ...inlineImages] : inlineImages);

export const pendingPostImages = ({
  headerImage,
  inlineImages,
}: PostFormImages) => ({
  headerImage: headerImage?.stored === false ? headerImage : undefined,
  inlineImages: inlineImages.filter((image) => !image.stored),
});

const pendingImage = (
  read: ReadImageFile,
  usedImageNames: string[],
  taken: PostFormImage[],
): PendingPostImage => ({
  ...read,
  stored: false,
  name: uniquePostImageName(read.name, [
    ...usedImageNames,
    ...taken.map((image) => image.name),
  ]),
  src: URL.createObjectURL(read.file),
});

export const releasePostFormImage = (image: PostFormImage) => {
  if (!image.stored) URL.revokeObjectURL(image.src);
};

const withoutHeaderImage = (images: PostFormImages): PostFormImages => ({
  ...images,
  headerImage: undefined,
  removedStoredImages: images.headerImage?.stored
    ? { ...images.removedStoredImages, headerImage: images.headerImage.name }
    : images.removedStoredImages,
});

export const withHeaderImage = (
  images: PostFormImages,
  read: ReadImageFile,
): PostFormImages => ({
  ...withoutHeaderImage(images),
  headerImage: pendingImage(read, images.usedImageNames, images.inlineImages),
});

export const withInlineImages = (
  images: PostFormImages,
  read: ReadImageFile[],
) => {
  const room =
    MAX_POST_INLINE_IMAGES - pendingPostImages(images).inlineImages.length;
  const added: PendingPostImage[] = [];

  for (const file of read.slice(0, room)) {
    added.push(
      pendingImage(file, images.usedImageNames, [
        ...allPostFormImages(images),
        ...added,
      ]),
    );
  }

  return {
    images: { ...images, inlineImages: [...images.inlineImages, ...added] },
    added,
    problems: read.length > room ? [TOO_MANY_IMAGES_PROBLEM] : [],
  };
};

const withoutInlineImage = (
  images: PostFormImages,
  removed: PostFormImage,
): PostFormImages => ({
  ...images,
  inlineImages: images.inlineImages.filter((image) => image !== removed),
  removedStoredImages: removed.stored
    ? {
        ...images.removedStoredImages,
        inlineImages: [
          ...images.removedStoredImages.inlineImages,
          removed.name,
        ],
      }
    : images.removedStoredImages,
});

export const withoutImage = (
  images: PostFormImages,
  removed: PostFormImage,
): PostFormImages =>
  images.headerImage === removed
    ? withoutHeaderImage(images)
    : withoutInlineImage(images, removed);

export const postFormImageRemovals = ({
  headerImage,
  removedStoredImages,
}: PostFormImages): PostFormImageRemovals => ({
  headerImage:
    removedStoredImages.headerImage !== undefined && headerImage === undefined
      ? null
      : undefined,
  removeInlineImages: removedStoredImages.inlineImages,
});

export const postFormMarkdownImages = (
  images: PostFormImages,
): PostMarkdownImage[] =>
  allPostFormImages(images).map((image) => ({
    reference: postImageReference(image.name),
    src: image.src,
    width: image.width,
    height: image.height,
  }));

export const unmatchedImageReferences = (
  content: string,
  images: PostFormImages,
) => {
  const references = new Set(
    allPostFormImages(images).map((image) => postImageReference(image.name)),
  );

  return postImageReferences(content).filter(
    (reference) => !references.has(reference),
  );
};
