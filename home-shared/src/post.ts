export const MAX_POST_TITLE_CHARACTERS = 200;

export const MAX_POST_CONTENT_CHARACTERS = 100_000;

export const MAX_POST_IMAGE_BYTES = 100 * 1024 * 1024;

export const MAX_POST_INLINE_IMAGES = 100;

export const MAX_POST_IMAGE_NAME_CHARACTERS = 64;

export const POST_THUMBNAIL_SIZES = ["large", "medium", "small"] as const;

export type PostThumbnailSize = (typeof POST_THUMBNAIL_SIZES)[number];

export const MAX_POST_THUMBNAIL_BYTES: Record<PostThumbnailSize, number> = {
  large: 8 * 1024 * 1024,
  medium: 64 * 1024,
  small: 16 * 1024,
};

const MAX_UTF8_BYTES_PER_CHARACTER = 4;

const POST_REQUEST_ENVELOPE_BYTES = 1024 * 1024;

export const MAX_POST_REQUEST_BODY_BYTES =
  (MAX_POST_TITLE_CHARACTERS + MAX_POST_CONTENT_CHARACTERS) *
    MAX_UTF8_BYTES_PER_CHARACTER +
  POST_REQUEST_ENVELOPE_BYTES;

export const DEFAULT_POST_PAGE_SIZE = 10;

export const MAX_POST_PAGE_SIZE = 50;

export const POST_IMAGE_EXTENSION_CONTENT_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
} as const;

type PostImageExtension = keyof typeof POST_IMAGE_EXTENSION_CONTENT_TYPES;

export type PostImageContentType =
  (typeof POST_IMAGE_EXTENSION_CONTENT_TYPES)[PostImageExtension];

export const POST_IMAGE_CONTENT_TYPES: PostImageContentType[] = [
  ...new Set(Object.values(POST_IMAGE_EXTENSION_CONTENT_TYPES)),
];

const isPostImageExtension = (
  extension: string,
): extension is PostImageExtension =>
  extension in POST_IMAGE_EXTENSION_CONTENT_TYPES;

export const postImageContentType = (
  name: string,
): PostImageContentType | undefined => {
  const extension = name.slice(name.lastIndexOf(".") + 1).toLowerCase();

  return isPostImageExtension(extension)
    ? POST_IMAGE_EXTENSION_CONTENT_TYPES[extension]
    : undefined;
};

export const POST_CONTENT_NAME = "content-markdown";

export const POST_IMAGES_DIRECTORY = "images";

export const POST_IMAGE_FIELD = "image";

export const POST_FULL_SIZE_SEGMENT = "fullSize";

export interface UploadedPostImage {
  name: string;
  contentType: string;
  byteSize: number;
  width: number;
  height: number;
}

export interface PostImage extends UploadedPostImage {
  path: string;
  reference: string;
}

export interface PostSummary {
  _id: string;
  title: string;
  authorUserId: string;
  authorUsername: string | null;
  createdDate: string;
  modifiedDate: string;
  revision: string;
  headerImage: PostImage | null;
}

export interface Post extends PostSummary {
  content: string;
  inlineImages: PostImage[];
}

export interface PostPagination {
  page: number;
  pageSize: number;
  totalPosts: number;
  totalPages: number;
  hasMore: boolean;
}

export const postImagePath = (postId: string, name: string) =>
  `posts/${postId}/images/${name}`;

export const postFullSizeImagePath = (postId: string, name: string) =>
  `${postImagePath(postId, name)}/${POST_FULL_SIZE_SEGMENT}`;

export const postThumbnailPath = (
  postId: string,
  name: string,
  size: PostThumbnailSize,
) => `${postImagePath(postId, name)}/${size}`;

export const postUploadsPath = "posts/uploads";

export const postUploadPath = (uploadId: string) =>
  `${postUploadsPath}/${uploadId}`;

export const postUploadImagePath = (uploadId: string, name: string) =>
  `${postUploadPath(uploadId)}/images/${name}`;

export const POST_IMAGE_REFERENCE_PREFIX = `./${POST_IMAGES_DIRECTORY}/`;

export const postImageReference = (name: string) =>
  `${POST_IMAGE_REFERENCE_PREFIX}${name}`;

export const postImageNameFromReference = (url: string) =>
  url.startsWith(POST_IMAGE_REFERENCE_PREFIX)
    ? url.slice(POST_IMAGE_REFERENCE_PREFIX.length)
    : undefined;

export const postUploadImageNames = ({
  headerImage,
  inlineImages,
}: {
  headerImage?: string;
  inlineImages: string[];
}) =>
  headerImage === undefined ? inlineImages : [headerImage, ...inlineImages];
