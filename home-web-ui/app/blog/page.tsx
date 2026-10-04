import BlogJsonLd from "@/app/blog/BlogJsonLd";
import { requestedPage } from "@/app/blog/links";
import NewPostButton from "@/app/blog/NewPostButton";
import Posts from "@/app/blog/Posts";
import PageColumn from "@/app/components/PageColumn";
import {
  blogMetadata,
  siteShareImages,
  unavailableBlogMetadata,
} from "@/app/lib/metadata";
import { getCachedPosts } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import type { ResolvingMetadata } from "next";
import { Suspense } from "react";

type BlogProps = { searchParams: SearchParams };

export const generateMetadata = async (
  { searchParams }: BlogProps,
  parent: ResolvingMetadata,
) => {
  const page = requestedPage((await searchParams).page);
  const result = await getCachedPosts(page);

  if (result.error || page > result.pagination.totalPages) {
    return unavailableBlogMetadata;
  }

  return blogMetadata(page, await siteShareImages(parent));
};

export const instant = false;

const Blog = ({ searchParams }: BlogProps) => (
  <PageColumn className="flex flex-col gap-12">
    <BlogJsonLd />
    <div className="flex flex-row flex-wrap items-center gap-4">
      <h1 className="text-4xl font-bold">Blog</h1>
      <Suspense fallback={null}>
        <NewPostButton searchParams={searchParams} />
      </Suspense>
    </div>
    <Posts searchParams={searchParams} />
  </PageColumn>
);

export default Blog;
