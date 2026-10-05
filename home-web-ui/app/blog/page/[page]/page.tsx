import Blog from "@/app/blog/Blog";
import { blogPageMetadata } from "@/app/blog/blogPageMetadata";
import { blogHref, requestedPage } from "@/app/blog/links";
import { getCachedPosts } from "@/app/lib/posts";
import type { ResolvingMetadata } from "next";
import { notFound, redirect } from "next/navigation";

type LaterBlogPageProps = { params: Promise<{ page: string }> };

export const instant = false;

const requireLaterPage = async ({ params }: LaterBlogPageProps) => {
  const { page: value } = await params;
  const page = requestedPage(value);

  if (String(page) !== value) notFound();
  if (page === 1) redirect(blogHref(1));

  const result = await getCachedPosts(page);

  if (!result.error && page > result.pagination.totalPages) {
    redirect(blogHref(result.pagination.totalPages));
  }

  return page;
};

export const generateStaticParams = () => [{ page: "2" }];

export const generateMetadata = async (
  props: LaterBlogPageProps,
  parent: ResolvingMetadata,
) => blogPageMetadata(await requireLaterPage(props), parent);

const LaterBlogPage = async (props: LaterBlogPageProps) => (
  <Blog page={await requireLaterPage(props)} />
);

export default LaterBlogPage;
