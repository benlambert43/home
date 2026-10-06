"use client";

import { requestedPage } from "@/app/blog/links";
import { useHydrated } from "@/app/lib/useHydrated";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

type BlogListPageProps = { children: (page: number) => ReactNode };

const FromSearchParams = ({ children }: BlogListPageProps) =>
  children(requestedPage(useSearchParams().get("page") ?? undefined));

const BlogListPage = ({ children }: BlogListPageProps) => {
  const hydrated = useHydrated();

  return hydrated ? (
    <FromSearchParams>{children}</FromSearchParams>
  ) : (
    children(1)
  );
};

export default BlogListPage;
