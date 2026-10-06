import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import NewPostForm from "@/app/blog/newPost/NewPostForm";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import { redirect } from "next/navigation";

export const metadata = pageMetadata("new blog post");

export const instant = false;

const NewPost = async () => {
  const user = await requireBffSessionUser();
  if (user.role !== "admin") {
    redirect("/blog");
  }

  return (
    <PageColumn className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">New Blog Post</h1>
      <div>
        <NewPostForm />
      </div>
    </PageColumn>
  );
};

export default NewPost;
