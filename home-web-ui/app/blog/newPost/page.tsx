import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import NewPostForm from "@/app/blog/newPost/NewPostForm";
import { redirect } from "next/navigation";

const NewPost = async () => {
  const user = await requireBffSessionUser();
  if (user.role !== "admin") {
    redirect("/blog");
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">New Blog Post</div>
      <div>
        <NewPostForm />
      </div>
    </div>
  );
};

export default NewPost;
