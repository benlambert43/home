import { blogHref, postHref, requestedPage } from "@/app/blog/links";
import PostByline from "@/app/blog/PostByline";
import { getPosts } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import Button from "@/app/ui/Button";
import { PostPagination, PostSummary } from "@home/shared";
import Link from "next/link";

const PostRow = ({ post, page }: { post: PostSummary; page: number }) => (
  <li className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
    <Link
      href={postHref(post._id, page)}
      className="text-xl font-semibold hover:underline"
    >
      {post.title}
    </Link>
    <PostByline post={post} />
  </li>
);

const PageLink = ({ page, children }: { page: number; children: string }) => (
  <Button type="link" linkProps={{ href: blogHref(page) }} size="small">
    {children}
  </Button>
);

const Pagination = ({ page, totalPages, hasMore }: PostPagination) => (
  <div className="flex items-center gap-4">
    {page > 1 && <PageLink page={page - 1}>Newer</PageLink>}
    <div className="text-sm text-slate-300">
      Page {page} of {totalPages}
    </div>
    {hasMore && <PageLink page={page + 1}>Older</PageLink>}
  </div>
);

const Posts = async ({ searchParams }: { searchParams: SearchParams }) => {
  const page = requestedPage((await searchParams).page);
  const result = await getPosts(page);

  if (result.error) return <p>{result.message}</p>;

  const { posts, pagination } = result;

  if (pagination.totalPosts === 0) return <p>No posts yet.</p>;

  return (
    <div className="flex max-w-160 flex-col gap-6">
      <ul className="flex flex-col divide-y divide-slate-700">
        {posts.map((post) => (
          <PostRow key={post._id} post={post} page={page} />
        ))}
      </ul>
      <Pagination {...pagination} />
    </div>
  );
};

export default Posts;
