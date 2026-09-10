import NewPostButton from "@/app/blog/NewPostButton";
import Posts from "@/app/blog/Posts";
import { SearchParams } from "@/app/lib/searchParams";
import { Suspense } from "react";

const Blog = ({ searchParams }: { searchParams: SearchParams }) => (
  <div className="flex flex-col gap-4 p-5">
    <div className="flex flex-row flex-wrap items-center gap-4">
      <h1 className="text-4xl font-bold">Blog</h1>
      <Suspense fallback={null}>
        <NewPostButton />
      </Suspense>
    </div>
    <Suspense fallback={null}>
      <Posts searchParams={searchParams} />
    </Suspense>
  </div>
);

export default Blog;
