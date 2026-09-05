import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { requestedPage, SearchParams } from "@/app/blog/links";
import NewPost from "@/app/blog/NewPost";
import Posts from "@/app/blog/Posts";

const Blog = async ({ searchParams }: { searchParams: SearchParams }) => {
  const user = await getBffSessionUser();
  const page = requestedPage((await searchParams).page);

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Blog</div>
      {user?.role === "admin" && <NewPost />}
      <Posts page={page} />
    </div>
  );
};

export default Blog;
