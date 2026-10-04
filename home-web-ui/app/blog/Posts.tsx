import {
  blogHref,
  postAnchor,
  postHref,
  requestedPage,
} from "@/app/blog/links";
import PostByline from "@/app/blog/PostByline";
import PostThumbnail from "@/app/blog/PostThumbnail";
import { getCachedPosts } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import Button from "@/app/ui/Button";
import { PostPagination, PostSummary } from "@home/shared";
import Link from "next/link";
import { redirect } from "next/navigation";

const THUMBNAIL_PIXELS = 120;

const PostRowThumbnail = ({
  post,
  page,
}: {
  post: PostSummary;
  page: number;
}) => (
  <Link
    href={postHref(post.slug, page)}
    tabIndex={-1}
    aria-hidden
    className="shrink-0"
  >
    <PostThumbnail
      post={post}
      pixels={THUMBNAIL_PIXELS}
      className="size-20 rounded-md sm:size-30"
    />
  </Link>
);

const PostRow = ({ post, page }: { post: PostSummary; page: number }) => (
  <li
    id={postAnchor(post.slug)}
    className="box-content flex min-h-30 scroll-mt-28 flex-row items-center
      gap-4 py-4 first:scroll-mt-[100vh] first:pt-0 last:pb-0 sm:scroll-mt-20
      sm:gap-6"
  >
    <PostRowThumbnail post={post} page={page} />
    <div className="flex min-w-0 flex-col gap-1">
      <Link
        href={postHref(post.slug, page)}
        className="line-clamp-4 text-lg leading-6 font-semibold hover:underline
          lg:line-clamp-3 lg:text-xl lg:leading-7"
      >
        {post.title}
      </Link>
      {post.excerpt && (
        <p className="line-clamp-2 text-sm leading-5 text-slate-300">
          {post.excerpt}
        </p>
      )}
      <PostByline post={post} />
    </div>
  </li>
);

const PageLink = ({ page, children }: { page: number; children: string }) => (
  <Button type="link" linkProps={{ href: blogHref(page) }} size="small">
    {children}
  </Button>
);

const Pagination = ({ page, totalPages, hasMore }: PostPagination) => (
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
    <div className="grid w-24 justify-self-end text-center">
      {page > 1 && <PageLink page={page - 1}>Previous</PageLink>}
    </div>
    <div className="text-sm text-slate-300">
      Page {page} of {totalPages}
    </div>
    <div className="grid w-24 justify-self-start text-center">
      {hasMore && <PageLink page={page + 1}>Next</PageLink>}
    </div>
  </div>
);

const Posts = async ({ searchParams }: { searchParams: SearchParams }) => {
  const page = requestedPage((await searchParams).page);
  const result = await getCachedPosts(page);

  if (result.error) return <p>{result.message}</p>;

  const { posts, pagination } = result;

  if (page > pagination.totalPages) redirect(blogHref(pagination.totalPages));

  if (pagination.totalPosts === 0) return <p>No posts yet.</p>;

  return (
    <div className="flex flex-col gap-6">
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
