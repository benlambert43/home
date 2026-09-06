import Post, { PostParams } from "@/app/blog/Post";
import { postCanonicalHref } from "@/app/blog/links";
import { pageMetadata } from "@/app/lib/metadata";
import { getPost } from "@/app/lib/posts";

type PostProps = { params: PostParams };

export const generateMetadata = async ({ params }: PostProps) => {
  const { id } = await params;
  const result = await getPost(id);

  return pageMetadata(
    result.error ? "blog" : result.post.title,
    postCanonicalHref(id),
  );
};

const BlogPost = ({ params }: PostProps) => <Post params={params} />;

export default BlogPost;
