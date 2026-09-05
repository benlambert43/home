import { PostSummary } from "@home/shared";

const PostByline = ({ post }: { post: PostSummary }) => (
  <div className="text-xs tracking-wide text-slate-400">
    {post.authorUsername ?? "unknown"} ·{" "}
    <time dateTime={post.createdDate}>
      {new Date(post.createdDate).toLocaleDateString()}
    </time>
  </div>
);

export default PostByline;
