import PostByline from "@/app/blog/PostByline";
import PostMarkdown from "@/app/blog/PostMarkdown";
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
      <h1
        className="from-portrait-dusk via-portrait-haze to-portrait-sky w-fit
          bg-linear-to-r bg-clip-text text-5xl font-medium text-transparent
          sm:text-6xl"
      >
        {post.title}
      </h1>
      <PostByline post={post} />
      <PostMarkdown content={post.content} />
      <div>
        <ReturnToBlogPosts />
      </div>
    </div>
  );
};

export default Post;
