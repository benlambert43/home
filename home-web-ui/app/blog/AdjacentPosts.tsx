"use client";

import BlogListPage from "@/app/blog/BlogListPage";
import { postHref } from "@/app/blog/links";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/16/solid";
import { AdjacentPost } from "@home/shared";
import Link from "next/link";
import { ReactNode } from "react";

const AdjacentPostLink = ({
  post,
  page,
  children,
  className = "",
}: {
  post: AdjacentPost;
  page: number;
  children: ReactNode;
  className?: string;
}) => (
  <Link
    href={postHref(post.slug, page)}
    className={`group flex min-w-0 flex-col gap-1 ${className}`}
  >
    <span
      className="flex items-center gap-1 text-xs tracking-wide text-slate-400"
    >
      {children}
    </span>
    <span className="line-clamp-3 leading-6 font-semibold group-hover:underline">
      {post.title}
    </span>
  </Link>
);

const AdjacentPosts = ({
  previous,
  next,
}: {
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
}) => {
  if (!previous && !next) return null;

  return (
    <BlogListPage>
      {(page) => (
        <nav
          aria-label="Previous and next posts"
          className="grid grid-cols-2 gap-6 border-t border-slate-700 pt-4"
        >
          {previous && (
            <AdjacentPostLink post={previous} page={page}>
              <ArrowLeftIcon className="size-3.5" />
              Previous
            </AdjacentPostLink>
          )}
          {next && (
            <AdjacentPostLink
              post={next}
              page={page}
              className="col-start-2 items-end text-right"
            >
              Next
              <ArrowRightIcon className="size-3.5" />
            </AdjacentPostLink>
          )}
        </nav>
      )}
    </BlogListPage>
  );
};

export default AdjacentPosts;
