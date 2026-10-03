import { blogHref, postHref } from "@/app/blog/links";
import PostThumbnail from "@/app/blog/PostThumbnail";
import { getCachedPosts } from "@/app/lib/posts";
import { PostSummary } from "@home/shared";
import Link from "next/link";
import { Suspense } from "react";

const RECENT_POSTS_COUNT = 10;

const THUMBNAIL_PIXELS = 32;

const SKELETON_TITLE_WIDTHS = ["w-3/4", "w-1/2", "w-5/6", "w-2/3", "w-3/5"];

const skeletonTitleWidth = (index: number) =>
  SKELETON_TITLE_WIDTHS[index % SKELETON_TITLE_WIDTHS.length];

const RecentPostRow = ({ post }: { post: PostSummary }) => (
  <li>
    <Link
      href={postHref(post._id)}
      className="group flex flex-row items-center gap-3"
    >
      <PostThumbnail
        post={post}
        pixels={THUMBNAIL_PIXELS}
        className="size-8 shrink-0 rounded-sm"
      />
      <span
        className="line-clamp-2 min-w-0 leading-5 font-semibold
          group-hover:underline"
      >
        {post.title}
      </span>
    </Link>
  </li>
);

const RecentPostList = async () => {
  const result = await getCachedPosts(1, RECENT_POSTS_COUNT);

  if (result.error) return <p>{result.message}</p>;

  const { posts, pagination } = result;

  if (posts.length === 0) return <p>No posts yet.</p>;

  return (
    <>
      <ul className="flex flex-col gap-3">
        {posts.map((post) => (
          <RecentPostRow key={post._id} post={post} />
        ))}
      </ul>
      {pagination.hasMore && (
        <Link
          href={blogHref(1)}
          className="w-fit text-sm text-slate-400 hover:text-slate-200
            hover:underline"
        >
          View all posts
        </Link>
      )}
    </>
  );
};

const SkeletonBlock = ({ className }: { className: string }) => (
  <span className={`rounded-sm bg-slate-700 ${className}`} />
);

const RecentPostListSkeleton = () => (
  <>
    <ul className="flex flex-col gap-3 motion-safe:animate-pulse" aria-hidden>
      {Array.from({ length: RECENT_POSTS_COUNT }, (_, index) => (
        <li key={index} className="flex flex-row items-center gap-3">
          <SkeletonBlock className="size-8 shrink-0" />
          <SkeletonBlock className={`h-4 ${skeletonTitleWidth(index)}`} />
        </li>
      ))}
    </ul>
    <SkeletonBlock className="my-1 h-3 w-24 motion-safe:animate-pulse" />
  </>
);

const RecentPosts = () => (
  <section className="flex flex-col gap-4">
    <h2 className="text-2xl">Recent Activity</h2>
    <Suspense fallback={<RecentPostListSkeleton />}>
      <RecentPostList />
    </Suspense>
  </section>
);

export default RecentPosts;
