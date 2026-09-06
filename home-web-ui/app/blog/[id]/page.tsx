import { getPost } from "@/app/actions/posts";
import { blogHref, postCanonicalHref } from "@/app/blog/links";
import PostByline from "@/app/blog/PostByline";
import ReturnToBlogPosts, {
  ReturnToBlogPostsButton,
} from "@/app/blog/ReturnToBlogPosts";
import { pageMetadata } from "@/app/lib/metadata";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type PostProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({ params }: PostProps) => {
  const { id } = await params;
  const result = await getPost(id);

  return pageMetadata(
    result.error ? "blog" : result.post.title,
    postCanonicalHref(id),
  );
};

const BlogPost = async ({ params }: PostProps) => {
  const result = await getPost((await params).id);

  if (result.error) notFound();

  const { post } = result;

  return (
    <div className="flex max-w-160 flex-col gap-4 p-5">
      <div className="text-4xl font-bold">{post.title}</div>
      <PostByline post={post} />
      <div className="whitespace-pre-wrap">{post.content}</div>
      <div>
        <Suspense fallback={<ReturnToBlogPostsButton href={blogHref(1)} />}>
          <ReturnToBlogPosts />
        </Suspense>
      </div>
    </div>
  );
};

export default BlogPost;
