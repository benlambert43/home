export const MAX_POST_TITLE_CHARACTERS = 200;

export const MAX_POST_CONTENT_CHARACTERS = 100_000;

export const MAX_POST_IMAGE_BYTES = 8 * 1024 * 1024;

export const MAX_POST_INLINE_IMAGES = 8;

export const MAX_POST_INLINE_IMAGE_NAME_CHARACTERS = 64;

export const MAX_POST_REQUEST_BODY_BYTES = 96 * 1024 * 1024;

export const DEFAULT_POST_PAGE_SIZE = 10;

export const MAX_POST_PAGE_SIZE = 50;

export type PostImageContentType =
  "image/png" | "image/jpeg" | "image/webp" | "image/gif" | "image/avif";

export const POST_CONTENT_NAME = "content-markdown";

export const POST_HEADER_IMAGE_NAME = "image-header";

export const POST_INLINE_IMAGES_DIRECTORY = "images";

export interface PostImageFields {
  name: string;
  contentType: string;
  byteSize: number;
  path: string;
}

export type PostImage = PostImageFields;

export interface PostInlineImageFields extends PostImageFields {
  reference: string;
}

export type PostInlineImage = PostInlineImageFields;

export interface PostSummaryFields<Id = string, Timestamp = string> {
  _id: Id;
  title: string;
  authorUserId: Id;
  authorUsername: string | null;
  createdDate: Timestamp;
  modifiedDate: Timestamp;
  revision: string;
  headerImage: PostImageFields;
}

export type PostSummary = PostSummaryFields;

export interface PostFields<
  Id = string,
  Timestamp = string,
> extends PostSummaryFields<Id, Timestamp> {
  content: string;
  inlineImages: PostInlineImageFields[];
}

export type Post = PostFields;

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
