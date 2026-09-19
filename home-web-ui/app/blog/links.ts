import { POST_FULL_SIZE_SEGMENT } from "@home/shared";

export const requestedPage = (value: string | string[] | undefined) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const blogHref = (page: number) =>
  page > 1 ? `/blog?page=${page}` : "/blog";

export const newPostHref = (page = 1) =>
  page > 1 ? `/blog/newPost?page=${page}` : "/blog/newPost";

const postPath = (id: string) => `/blog/${id}`;

export const postHref = (id: string, page = 1) =>
  page > 1 ? `${postPath(id)}?page=${page}` : postPath(id);

export const postImageHref = (id: string, name: string) =>
  `${postPath(id)}/images/${encodeURIComponent(name)}`;

export const postFullSizeImageHref = (id: string, name: string) =>
  `${postImageHref(id, name)}/${POST_FULL_SIZE_SEGMENT}`;

export const postUploadImageHref = (uploadId: string, name: string) =>
  `/blog/uploads/${uploadId}/images/${encodeURIComponent(name)}`;
