import PostDate from "@/app/blog/PostDate";
import { PostSummary } from "@home/shared";

const PostByline = ({ post }: { post: PostSummary }) => (
  <div className="text-xs tracking-wide text-slate-400">
    {post.authorUsername ?? "unknown"} · <PostDate date={post.createdDate} />
  </div>
);

export default PostByline;
