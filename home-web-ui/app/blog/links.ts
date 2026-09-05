export type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export const requestedPage = (value: string | string[] | undefined) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export const blogHref = (page: number) =>
  page > 1 ? `/blog?page=${page}` : "/blog";

export const postHref = (id: string, page: number) =>
  page > 1 ? `/blog/${id}?page=${page}` : `/blog/${id}`;
