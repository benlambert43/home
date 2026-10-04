import { postHref } from "@/app/blog/links";
import { getPosts, POSTS_TAG } from "@/app/lib/posts";
import { siteUrl } from "@/app/lib/siteUrl";
import { MAX_POST_PAGE_SIZE, PostSummary } from "@home/shared";
import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

const PAGE_PATHS = [
  "/",
  "/blog",
  "/projects",
  "/projects/software",
  "/projects/lifelist",
  "/projects/adventures",
  "/about",
];

const getAllPosts = async (): Promise<PostSummary[] | undefined> => {
  const posts: PostSummary[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const result = await getPosts(page, MAX_POST_PAGE_SIZE);
    if (result.error) return undefined;

    posts.push(...result.posts);
    hasMore = result.pagination.hasMore;
    page += 1;
  }

  return posts;
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  "use cache";
  cacheTag(POSTS_TAG);

  const posts = await getAllPosts();
  if (posts === undefined) {
    cacheLife("seconds");
  } else {
    cacheLife("days");
  }

  return [
    ...PAGE_PATHS.map((path) => ({ url: siteUrl(path) })),
    ...(posts ?? []).map((post) => ({
      url: siteUrl(postHref(post._id)),
      lastModified: post.modifiedDate,
    })),
  ];
};

export default sitemap;
