import { getPost } from "@/app/actions/posts";
import { blogHref, requestedPage, SearchParams } from "@/app/blog/links";
import PostByline from "@/app/blog/PostByline";
import { pageMetadata } from "@/app/lib/metadata";
import Button from "@/app/ui/Button";
import { notFound } from "next/navigation";

type PostProps = {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
};

export const generateMetadata = async ({ params }: PostProps) => {
  const result = await getPost((await params).id);

  return pageMetadata(result.error ? "blog" : result.post.title);
};

const BlogPost = async ({ params, searchParams }: PostProps) => {
  const result = await getPost((await params).id);

  if (result.error) notFound();

  const { post } = result;
  const backHref = blogHref(requestedPage((await searchParams).page));

  return (
    <div className="flex max-w-160 flex-col gap-4 p-5">
      <div className="text-4xl font-bold">{post.title}</div>
      <PostByline post={post} />
      <div className="whitespace-pre-wrap">{post.content}</div>
      <div>
        <Button type="link" linkProps={{ href: backHref }} size="small">
          Back to Blog
        </Button>
      </div>
    </div>
  );
};

export default BlogPost;
