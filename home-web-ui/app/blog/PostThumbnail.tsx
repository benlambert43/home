import { postImageHref } from "@/app/blog/links";
import { PostSummary } from "@home/shared";
import Image from "next/image";
import { createHash } from "node:crypto";

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

const PLACEHOLDER_BAND_PERCENTS = [6, 9, 12];

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
    `repeating-linear-gradient(${angle}deg, ${a} 0 ${band}%, ${b} 0 ${band * 2}%, ${c} 0 ${band * 3}%)`,
  ({ palette: [a, b, c], x, y, band }) =>
    `repeating-radial-gradient(circle at ${x} ${y}, ${a} 0 ${band}%, ${b} 0 ${band * 2}%, ${c} 0 ${band * 3}%)`,
  ({ palette: [a, b], angle, x, y }) =>
    `repeating-conic-gradient(from ${angle}deg at ${x} ${y}, ${a} 0 12.5%, ${b} 0 25%)`,
  ({ palette: [a, b, c], angle, band }) =>
    `radial-gradient(${a} 35%, transparent 40%) 0 0 / ${band * 3}% ${band * 3}%, linear-gradient(${angle}deg, ${b}, ${c})`,
  ({ palette: [a, b, c], angle, x, y }) =>
    `radial-gradient(circle at ${x} ${y}, ${a}, transparent 70%), linear-gradient(${angle}deg, ${b}, ${c})`,
  ({ palette: [a, b], band }) =>
    `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%) 0 0 / ${band * 4}% ${band * 4}%`,
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
    band: pick(PLACEHOLDER_BAND_PERCENTS, bandByte),
  });
};

const PostThumbnail = ({
  post,
  pixels,
  className,
}: {
  post: PostSummary;
  pixels: number;
  className: string;
}) => {
  const image = post.headerImage;

  if (!image) {
    return (
      <span
        className={`block ${className}`}
        style={{ background: placeholderBackground(post._id) }}
      />
    );
  }

  return (
    <Image
      src={postImageHref(post.slug, image.name)}
      alt=""
      width={pixels}
      height={pixels}
      className={`${className} object-cover`}
    />
  );
};

export default PostThumbnail;
