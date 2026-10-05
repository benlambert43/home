import BlogJsonLd from "@/app/blog/BlogJsonLd";
import NewPostButton from "@/app/blog/NewPostButton";
import Posts from "@/app/blog/Posts";
import PageColumn from "@/app/components/PageColumn";
import { Suspense } from "react";

const Blog = ({ page }: { page: number }) => (
  <PageColumn className="flex flex-col gap-12">
    <BlogJsonLd />
    <div className="flex flex-row flex-wrap items-center gap-4">
      <h1 className="text-4xl font-bold">Blog</h1>
      <NewPostButton page={page} />
    </div>
    <Suspense fallback={null}>
      <Posts page={page} />
    </Suspense>
  </PageColumn>
);

export default Blog;
