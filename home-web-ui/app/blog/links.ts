import { POST_FULL_SIZE_SEGMENT } from "@home/shared";

export const requestedPage = (value: string | string[] | undefined) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const postAnchor = (id: string) => `post-${id}`;

export const blogHref = (page: number, postId?: string) => {
  const href = page > 1 ? `/blog?page=${page}` : "/blog";
  return postId ? `${href}#${postAnchor(postId)}` : href;
};

export const newPostHref = (page = 1) =>
  page > 1 ? `/blog/newPost?page=${page}` : "/blog/newPost";

const postPath = (id: string) => `/blog/${id}`;

export const postHref = (id: string, page = 1) =>
  page > 1 ? `${postPath(id)}?page=${page}` : postPath(id);

const editPostPath = (id: string) => `${postPath(id)}/edit`;

export const editPostHref = (id: string, page = 1) =>
  page > 1 ? `${editPostPath(id)}?page=${page}` : editPostPath(id);

export const postImageHref = (id: string, name: string) =>
  `${postPath(id)}/images/${encodeURIComponent(name)}`;

export const postFullSizeImageHref = (id: string, name: string) =>
  `${postImageHref(id, name)}/${POST_FULL_SIZE_SEGMENT}`;

export const postUploadImageHref = (uploadId: string, name: string) =>
  `/blog/uploads/${uploadId}/images/${encodeURIComponent(name)}`;
