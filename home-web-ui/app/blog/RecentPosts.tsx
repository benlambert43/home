import { blogHref, postHref, postImageHref } from "@/app/blog/links";
import { getPosts } from "@/app/lib/posts";
import { PostSummary } from "@home/shared";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { createHash } from "node:crypto";

const RECENT_POSTS_COUNT = 10;

const THUMBNAIL_PIXELS = 32;

const THUMBNAIL_CLASSES = "size-8 shrink-0 rounded-sm";

const DUSK = "var(--color-portrait-dusk)";

const HAZE = "var(--color-portrait-haze)";

const SKY = "var(--color-portrait-sky)";

type PortraitPalette = [string, string, string];

const PORTRAIT_PALETTES: PortraitPalette[] = [
  [DUSK, HAZE, SKY],
  [DUSK, SKY, HAZE],
  [HAZE, DUSK, SKY],
  [HAZE, SKY, DUSK],
  [SKY, DUSK, HAZE],
  [SKY, HAZE, DUSK],
];

const PLACEHOLDER_ANGLES = [
  0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330,
];

const PLACEHOLDER_POSITIONS = ["0%", "25%", "50%", "75%", "100%"];

const PLACEHOLDER_BANDS = [2, 3, 4];

type PlaceholderSeed = {
  palette: PortraitPalette;
  angle: number;
  x: string;
  y: string;
  band: number;
};

const PLACEHOLDER_PATTERNS: ((seed: PlaceholderSeed) => string)[] = [
  ({ palette: [a, b, c], angle }) =>
    `linear-gradient(${angle}deg, ${a}, ${b}, ${c})`,
  ({ palette: [a, b, c], x, y }) =>
    `radial-gradient(circle at ${x} ${y}, ${a}, ${b}, ${c})`,
  ({ palette: [a, b, c], angle, x, y }) =>
    `conic-gradient(from ${angle}deg at ${x} ${y}, ${a}, ${b}, ${c}, ${a})`,
  ({ palette: [a, b, c], angle, band }) =>
    `repeating-linear-gradient(${angle}deg, ${a} 0 ${band}px, ${b} 0 ${band * 2}px, ${c} 0 ${band * 3}px)`,
  ({ palette: [a, b, c], x, y, band }) =>
    `repeating-radial-gradient(circle at ${x} ${y}, ${a} 0 ${band}px, ${b} 0 ${band * 2}px, ${c} 0 ${band * 3}px)`,
  ({ palette: [a, b], angle, x, y }) =>
    `repeating-conic-gradient(from ${angle}deg at ${x} ${y}, ${a} 0 12.5%, ${b} 0 25%)`,
  ({ palette: [a, b, c], angle, band }) =>
    `radial-gradient(${a} 35%, transparent 40%) 0 0 / ${band * 3}px ${band * 3}px, linear-gradient(${angle}deg, ${b}, ${c})`,
  ({ palette: [a, b, c], angle, x, y }) =>
    `radial-gradient(circle at ${x} ${y}, ${a}, transparent 70%), linear-gradient(${angle}deg, ${b}, ${c})`,
  ({ palette: [a, b], band }) =>
    `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / ${band * 4}px ${band * 4}px`,
];

const pick = <Option,>(options: Option[], byte: number) =>
  options[byte % options.length];

const placeholderBackground = (id: string) => {
  const [patternByte, paletteByte, angleByte, xByte, yByte, bandByte] =
    createHash("sha256").update(id).digest();
  const pattern = pick(PLACEHOLDER_PATTERNS, patternByte);

  return pattern({
    palette: pick(PORTRAIT_PALETTES, paletteByte),
    angle: pick(PLACEHOLDER_ANGLES, angleByte),
    x: pick(PLACEHOLDER_POSITIONS, xByte),
    y: pick(PLACEHOLDER_POSITIONS, yByte),
    band: pick(PLACEHOLDER_BANDS, bandByte),
  });
};

const RecentPostThumbnail = ({ post }: { post: PostSummary }) => {
  const image = post.headerImage;

  if (!image) {
    return (
      <span
        className={THUMBNAIL_CLASSES}
        style={{ background: placeholderBackground(post._id) }}
      />
    );
  }

  return (
    <Image
      src={postImageHref(post._id, image.name)}
      alt=""
      width={THUMBNAIL_PIXELS}
      height={THUMBNAIL_PIXELS}
      className={`${THUMBNAIL_CLASSES} object-cover`}
    />
  );
};

const RecentPostRow = ({ post }: { post: PostSummary }) => (
  <li>
    <Link
      href={postHref(post._id)}
      className="group flex flex-row items-center gap-3"
    >
      <RecentPostThumbnail post={post} />
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
  await connection();
  const result = await getPosts(1, RECENT_POSTS_COUNT);

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

const RecentPosts = () => (
  <section className="flex w-full max-w-120 flex-col gap-4">
    <h2 className="text-2xl">Recent Activity</h2>
    <RecentPostList />
  </section>
);

export default RecentPosts;
