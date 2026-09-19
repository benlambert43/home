import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import { requestedPage } from "@/app/blog/links";
import NewPostForm from "@/app/blog/newPost/NewPostForm";
import { pageMetadata } from "@/app/lib/metadata";
import { SearchParams } from "@/app/lib/searchParams";
import { redirect } from "next/navigation";

export const metadata = pageMetadata("new blog post");

const NewPost = async ({ searchParams }: { searchParams: SearchParams }) => {
  const user = await requireBffSessionUser();
  if (user.role !== "admin") {
    redirect("/blog");
  }

  const page = requestedPage((await searchParams).page);

  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-4xl font-bold">New Blog Post</h1>
      <div>
        <NewPostForm page={page} />
      </div>
    </div>
  );
};

export default NewPost;
