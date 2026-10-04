import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import EditPostForm from "@/app/blog/[slug]/edit/EditPostForm";
import { postHref, requestedPage } from "@/app/blog/links";
import { PostParams } from "@/app/blog/Post";
import PostProblem from "@/app/blog/PostProblem";
import { pageMetadata } from "@/app/lib/metadata";
import { getPost, getPostForEdit } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import { redirect } from "next/navigation";

export const metadata = pageMetadata("edit blog post");

export const instant = false;

const EditPost = async ({
  params,
  searchParams,
}: {
  params: PostParams;
  searchParams: SearchParams;
}) => {
  const { slug } = await params;
  const page = requestedPage((await searchParams).page);

  const user = await requireBffSessionUser();
  if (user.role !== "admin") {
    redirect(postHref(slug, page));
  }

  const lookup = await getPost(slug);
  const result = lookup.error ? lookup : await getPostForEdit(lookup.post._id);

  if (result.error) {
    return (
      <PostProblem
        headline="Post Unavailable"
        detail={result.message}
        page={page}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-4xl font-bold">Edit Blog Post</h1>
      <div>
        <EditPostForm
          post={result.post}
          usedImageNames={result.usedImageNames}
          page={page}
        />
      </div>
    </div>
  );
};

export default EditPost;
