import { blogHref, postHref } from "@/app/blog/links";
import { BLOG_DESCRIPTION, BLOG_NAME, FEED_PATH } from "@/app/lib/metadata";
import { getPosts, POSTS_TAG } from "@/app/lib/posts";
import { siteUrl } from "@/app/lib/siteUrl";
import { PostSummary } from "@home/shared";
import { cacheLife, cacheTag } from "next/cache";

const FEED_POST_COUNT = 20;

const escapeXml = (text: string) =>
  text.replace(/[<>&'"]/g, (character) => `&#${character.charCodeAt(0)};`);

const rfc822 = (date: string) => new Date(date).toUTCString();

const element = (name: string, content: string | null) =>
  content === null ? "" : `<${name}>${escapeXml(content)}</${name}>`;

const item = (post: PostSummary) => {
  const url = siteUrl(postHref(post.slug));

  return [
    "<item>",
    element("title", post.title),
    element("link", url),
    element("guid", url),
    element("pubDate", rfc822(post.createdDate)),
    element("description", post.excerpt),
    element("dc:creator", post.authorUsername),
    "</item>",
  ].join("");
};

const feed = async () => {
  "use cache";
  cacheTag(POSTS_TAG);

  const result = await getPosts(1, FEED_POST_COUNT);

  if (result.error) {
    cacheLife("seconds");
  } else {
    cacheLife("days");
  }

  const posts = result.error ? [] : result.posts;
  const latest =
    posts
      .map((post) => post.modifiedDate)
      .sort()
      .at(-1) ?? null;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "<channel>",
    element("title", BLOG_NAME),
    element("link", siteUrl(blogHref(1))),
    element("description", BLOG_DESCRIPTION),
    element("language", "en"),
    `<atom:link href="${escapeXml(siteUrl(FEED_PATH))}" rel="self" type="application/rss+xml"/>`,
    element("lastBuildDate", latest === null ? null : rfc822(latest)),
    ...posts.map(item),
    "</channel>",
    "</rss>",
  ].join("\n");
};

export const GET = async () =>
  new Response(await feed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
