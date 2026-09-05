export const MAX_POST_TITLE_CHARACTERS = 200;

export const MAX_POST_CONTENT_CHARACTERS = 100_000;

export const MAX_POST_IMAGE_BYTES = 8 * 1024 * 1024;

export const MAX_POST_INLINE_IMAGES = 8;

export const MAX_POST_INLINE_IMAGE_NAME_CHARACTERS = 64;

export const base64Characters = (bytes: number) => Math.ceil(bytes / 3) * 4;

const MAX_UTF8_BYTES_PER_CHARACTER = 4;

const POST_REQUEST_ENVELOPE_BYTES = 1024 * 1024;

export const MAX_POST_REQUEST_BODY_BYTES =
  (MAX_POST_INLINE_IMAGES + 1) *
    (base64Characters(MAX_POST_IMAGE_BYTES) +
      MAX_POST_INLINE_IMAGE_NAME_CHARACTERS) +
  (MAX_POST_TITLE_CHARACTERS + MAX_POST_CONTENT_CHARACTERS) *
    MAX_UTF8_BYTES_PER_CHARACTER +
  POST_REQUEST_ENVELOPE_BYTES;

export const DEFAULT_POST_PAGE_SIZE = 10;

export const MAX_POST_PAGE_SIZE = 50;

export type PostImageContentType =
  "image/png" | "image/jpeg" | "image/webp" | "image/gif" | "image/avif";

export const POST_CONTENT_NAME = "content-markdown";

export const POST_HEADER_IMAGE_NAME = "image-header";

export const POST_INLINE_IMAGES_DIRECTORY = "images";

export interface PostImage {
  name: string;
  contentType: string;
  byteSize: number;
  path: string;
}

export interface PostInlineImage extends PostImage {
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
  inlineImages: PostInlineImage[];
}

export interface PostPagination {
  page: number;
  pageSize: number;
  totalPosts: number;
  totalPages: number;
  hasMore: boolean;
}

export const postHeaderImagePath = (postId: string) =>
  `posts/${postId}/headerImage`;

export const postInlineImagePath = (postId: string, name: string) =>
  `posts/${postId}/images/${name}`;

export const postInlineImageReference = (name: string) =>
  `./${POST_INLINE_IMAGES_DIRECTORY}/${name}`;
