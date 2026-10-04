import { postHref } from "@/app/blog/links";
import { AdjacentPost } from "@home/shared";
import Link from "next/link";

const AdjacentPostLink = ({
  post,
  page,
  label,
  className = "",
}: {
  post: AdjacentPost;
  page: number;
  label: string;
  className?: string;
}) => (
  <Link
    href={postHref(post.slug, page)}
    className={`group flex min-w-0 flex-col gap-1 ${className}`}
  >
    <span className="text-xs tracking-wide text-slate-400">{label}</span>
    <span className="line-clamp-3 leading-6 font-semibold group-hover:underline">
      {post.title}
    </span>
  </Link>
);

const AdjacentPosts = ({
  previous,
  next,
  page,
}: {
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
  page: number;
}) => {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Older and newer posts"
      className="grid grid-cols-2 gap-6 border-t border-slate-700 pt-4"
    >
      {previous && (
        <AdjacentPostLink post={previous} page={page} label="Older post" />
      )}
      {next && (
        <AdjacentPostLink
          post={next}
          page={page}
          label="Newer post"
          className="col-start-2 items-end text-right"
        />
      )}
    </nav>
  );
};

export default AdjacentPosts;
