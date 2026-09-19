import Post, { PostParams } from "@/app/blog/Post";
import { postHref } from "@/app/blog/links";
import { pageMetadata } from "@/app/lib/metadata";
import { getPost } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";

type PostProps = { params: PostParams; searchParams: SearchParams };

export const generateMetadata = async ({ params }: PostProps) => {
  const { id } = await params;
  const result = await getPost(id);

  return pageMetadata(result.error ? "blog" : result.post.title, postHref(id));
};

const BlogPost = ({ params, searchParams }: PostProps) => (
  <Post params={params} searchParams={searchParams} />
);

export default BlogPost;
