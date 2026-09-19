import { POST_FULL_SIZE_SEGMENT } from "@home/shared";

export const requestedPage = (value: string | string[] | undefined) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const blogHref = (page: number) =>
  page > 1 ? `/blog?page=${page}` : "/blog";

export const newPostHref = "/blog/newPost";

export const postHref = (id: string) => `/blog/${id}`;

export const postImageHref = (id: string, name: string) =>
  `${postHref(id)}/images/${encodeURIComponent(name)}`;

export const postFullSizeImageHref = (id: string, name: string) =>
  `${postImageHref(id, name)}/${POST_FULL_SIZE_SEGMENT}`;

export const postUploadImageHref = (uploadId: string, name: string) =>
  `/blog/uploads/${uploadId}/images/${encodeURIComponent(name)}`;
