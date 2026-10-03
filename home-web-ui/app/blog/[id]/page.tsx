import Post, { PostParams } from "@/app/blog/Post";
import { postHref } from "@/app/blog/links";
import { pageMetadata, unavailableBlogMetadata } from "@/app/lib/metadata";
import { getPost } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import { postExcerpt } from "@home/shared";

type PostProps = { params: PostParams; searchParams: SearchParams };

export const instant = false;

export const generateMetadata = async ({ params }: PostProps) => {
  const { id } = await params;
  const result = await getPost(id);

  if (result.error) return unavailableBlogMetadata;

  return pageMetadata(result.post.title, {
    canonicalPath: postHref(id),
    description: postExcerpt(result.post.content),
  });
};

const BlogPost = ({ params, searchParams }: PostProps) => (
  <Post params={params} searchParams={searchParams} />
);

export default BlogPost;
