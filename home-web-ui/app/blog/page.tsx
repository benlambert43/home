import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import NewPost from "@/app/blog/NewPost";

const Blog = async () => {
  const user = await getBffSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Blog</div>
      {user?.role === "admin" && <NewPost />}
      <div>Recent Posts</div>
    </div>
  );
};

export default Blog;
