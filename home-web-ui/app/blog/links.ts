import { POST_FULL_SIZE_SEGMENT, POST_SHARE_IMAGE_SEGMENT } from "@home/shared";

export const requestedPage = (value: string | string[] | undefined) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const postAnchor = (slug: string) => `post-${slug}`;

export const blogHref = (page: number, postSlug?: string) => {
  const href = page > 1 ? `/blog?page=${page}` : "/blog";
  return postSlug ? `${href}#${postAnchor(postSlug)}` : href;
};

export const newPostHref = (page = 1) =>
  page > 1 ? `/blog/newPost?page=${page}` : "/blog/newPost";

const postPath = (slug: string) => `/blog/${slug}`;

export const postHref = (slug: string, page = 1) =>
  page > 1 ? `${postPath(slug)}?page=${page}` : postPath(slug);

const editPostPath = (slug: string) => `${postPath(slug)}/edit`;

export const editPostHref = (slug: string, page = 1) =>
  page > 1 ? `${editPostPath(slug)}?page=${page}` : editPostPath(slug);

export const postImageHref = (slug: string, name: string) =>
  `${postPath(slug)}/images/${encodeURIComponent(name)}`;

export const postFullSizeImageHref = (slug: string, name: string) =>
  `${postImageHref(slug, name)}/${POST_FULL_SIZE_SEGMENT}`;

export const postShareImageHref = (slug: string, name: string) =>
  `${postImageHref(slug, name)}/${POST_SHARE_IMAGE_SEGMENT}`;

export const postUploadImageHref = (uploadId: string, name: string) =>
  `/blog/uploads/${uploadId}/images/${encodeURIComponent(name)}`;
