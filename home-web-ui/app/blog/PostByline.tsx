import PostDate from "@/app/blog/PostDate";
import { PostSummary } from "@home/shared";

export type PostBylineDetails = Pick<
  PostSummary,
  "authorUsername" | "createdDate" | "modifiedDate"
>;

const PostByline = ({ post }: { post: PostBylineDetails }) => (
  <div className="text-xs tracking-wide text-slate-400">
    {post.authorUsername ?? "unknown"} · <PostDate date={post.createdDate} />
    {post.modifiedDate !== post.createdDate && (
      <>
        {" "}
        · edited <PostDate date={post.modifiedDate} />
      </>
    )}
  </div>
);

export default PostByline;
