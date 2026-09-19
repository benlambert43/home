import {
  blogHref,
  postHref,
  postImageHref,
  requestedPage,
} from "@/app/blog/links";
import PostByline from "@/app/blog/PostByline";
import { getPosts } from "@/app/lib/posts";
import { SearchParams } from "@/app/lib/searchParams";
import Button from "@/app/ui/Button";
import { PostPagination, PostSummary } from "@home/shared";
import Image from "next/image";
import Link from "next/link";

const THUMBNAIL_PIXELS = 120;

const PostRowThumbnail = ({ post }: { post: PostSummary }) => {
  const image = post.headerImage;

  if (!image) return null;

  return (
    <Link href={postHref(post._id)} className="shrink-0">
      <Image
        src={postImageHref(post._id, image.name)}
        alt=""
        width={THUMBNAIL_PIXELS}
        height={THUMBNAIL_PIXELS}
        className="size-20 rounded-md object-cover sm:size-30"
      />
    </Link>
  );
};

const PostRow = ({ post }: { post: PostSummary }) => (
  <li
    className="box-content flex h-30 flex-row items-center gap-4 py-4 first:pt-0
      last:pb-0 sm:gap-6"
  >
    <PostRowThumbnail post={post} />
    <div className="flex min-w-0 flex-col gap-1">
      <Link
        href={postHref(post._id)}
        className="line-clamp-4 text-lg leading-6 font-semibold hover:underline
          lg:line-clamp-3 lg:text-xl lg:leading-7"
      >
        {post.title}
      </Link>
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
    <div className="flex max-w-240 flex-col gap-6 2xl:max-w-280">
      <ul className="flex flex-col divide-y divide-slate-700">
        {posts.map((post) => (
          <PostRow key={post._id} post={post} />
        ))}
      </ul>
      <Pagination {...pagination} />
    </div>
  );
};

export default Posts;
