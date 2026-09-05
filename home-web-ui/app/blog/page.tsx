import { requestedPage, SearchParams } from "@/app/blog/links";
import NewPost from "@/app/blog/NewPost";
import Posts from "@/app/blog/Posts";
import { Suspense } from "react";

const Blog = async ({ searchParams }: { searchParams: SearchParams }) => {
  const page = requestedPage((await searchParams).page);

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Blog</div>
      <Suspense fallback={null}>
        <NewPost />
      </Suspense>
      <Posts page={page} />
    </div>
  );
};

export default Blog;
