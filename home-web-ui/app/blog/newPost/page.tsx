import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import NewPostForm from "@/app/blog/newPost/NewPostForm";
import { POST_COLUMN_WIDTH_CLASS_NAME } from "@/app/blog/postColumn";
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
    <PageColumn
      className="flex flex-col gap-4"
      widthClassName={POST_COLUMN_WIDTH_CLASS_NAME}
    >
      <h1 className="text-4xl font-bold">New Blog Post</h1>
      <div>
        <NewPostForm authorUsername={user.username} />
      </div>
    </PageColumn>
  );
};

export default NewPost;
