import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";

const Blog = async () => {
  const user = await requireBffSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Blog</div>
      {user.role === "admin" && <div>New Post</div>}
      <div>Recent Posts</div>
    </div>
  );
};

export default Blog;
