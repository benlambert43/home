import PostByline from "@/app/blog/PostByline";
import PostProblem from "@/app/blog/PostProblem";
import ReturnToBlogPosts from "@/app/blog/ReturnToBlogPosts";
import { getPost } from "@/app/lib/posts";

export type PostParams = Promise<{ id: string }>;

const Post = async ({ params }: { params: PostParams }) => {
  const result = await getPost((await params).id);

  if (result.error) {
    return <PostProblem headline="Post Unavailable" detail={result.message} />;
  }

  const { post } = result;

  return (
    <div className="flex max-w-160 flex-col gap-4 p-5">
      <div className="text-4xl font-bold">{post.title}</div>
      <PostByline post={post} />
      <div className="whitespace-pre-wrap">{post.content}</div>
      <div>
        <ReturnToBlogPosts />
      </div>
    </div>
  );
};

export default Post;
