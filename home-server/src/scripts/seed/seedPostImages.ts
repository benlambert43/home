import { randomBytes } from "node:crypto";
import sharp, { Sharp } from "sharp";
import { PostImageContentType, postImageContentType } from "@home/shared";

const FRAME_DELAY_MILLISECONDS = 350;

const LOOP_FOREVER = 0;

const JPEG_QUALITY = 92;

const NOISE_CHANNELS = 3;

const SIDEWAYS_DEGREES = 270;

const SIDEWAYS_EXIF_ORIENTATION = 6;

const FAR_RIDGE = [
  [0, 0.72],
  [0.18, 0.5],
  [0.34, 0.66],
  [0.55, 0.44],
  [0.78, 0.68],
  [1, 0.52],
  [1, 1],
  [0, 1],
];

const NEAR_RIDGE = [
  [0, 0.86],
  [0.25, 0.64],
  [0.45, 0.8],
  [0.7, 0.6],
  [1, 0.82],
  [1, 1],
  [0, 1],
];

export type SeedPalette = [sky: string, land: string];

export interface SeedImage {
  name: string;
  width: number;
  height: number;
  colors: SeedPalette;
  frames?: number;
  sideways?: boolean;
  noisy?: boolean;
}

const ridge = (points: number[][], { width, height }: SeedImage) =>
  points.map(([x, y]) => `${x * width},${y * height}`).join(" ");

const artwork = (image: SeedImage, sunProgress: number) => {
  const { name, width, height, colors } = image;
  const [sky, land] = colors;
  const unit = Math.min(width, height);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${sky}"/>
      <stop offset="1" stop-color="${land}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#sky)"/>
  <circle cx="${width * (0.15 + 0.7 * sunProgress)}" cy="${height * (0.42 - 0.2 * Math.sin(Math.PI * sunProgress))}" r="${unit * 0.1}" fill="#ffffff" fill-opacity="0.85"/>
  <polygon points="${ridge(FAR_RIDGE, image)}" fill="${land}" fill-opacity="0.6"/>
  <polygon points="${ridge(NEAR_RIDGE, image)}" fill="#0f172a" fill-opacity="0.6"/>
  <text x="${unit * 0.05}" y="${height - unit * 0.05}" font-family="Helvetica, Arial, sans-serif" font-size="${unit * 0.06}" fill="#ffffff">${name} · ${width} × ${height}</text>
</svg>`);
};

const animation = async (image: SeedImage, frames: number) => {
  const drawn = await Promise.all(
    Array.from({ length: frames }, (_, frame) =>
      sharp(artwork(image, frame / (frames - 1)))
        .png()
        .toBuffer(),
    ),
  );

  return sharp(drawn, { join: { animated: true } });
};

const photograph = (image: SeedImage) => {
  const { width, height } = image;

  return sharp(artwork(image, 0.5)).composite([
    {
      input: randomBytes(width * height * NOISE_CHANNELS),
      raw: { width, height, channels: NOISE_CHANNELS },
      blend: "soft-light",
    },
  ]);
};

const drawing = async (image: SeedImage) => {
  if (image.frames !== undefined && image.frames > 1) {
    return animation(image, image.frames);
  }

  const still = image.noisy ? photograph(image) : sharp(artwork(image, 0.5));

  return image.sideways
    ? still
        .rotate(SIDEWAYS_DEGREES)
        .withMetadata({ orientation: SIDEWAYS_EXIF_ORIENTATION })
    : still;
};

const ENCODERS: Record<PostImageContentType, (image: Sharp) => Sharp> = {
  "image/png": (image) => image.png(),
  "image/jpeg": (image) => image.jpeg({ quality: JPEG_QUALITY }),
  "image/webp": (image) =>
    image.webp({ delay: FRAME_DELAY_MILLISECONDS, loop: LOOP_FOREVER }),
  "image/gif": (image) =>
    image.gif({ delay: FRAME_DELAY_MILLISECONDS, loop: LOOP_FOREVER }),
  "image/avif": (image) => image.avif(),
};

export const renderSeedImage = async (image: SeedImage): Promise<Buffer> => {
  const contentType = postImageContentType(image.name);

  if (!contentType) {
    throw new Error(`${image.name} is not a supported post image name.`);
  }

  return ENCODERS[contentType](await drawing(image)).toBuffer();
};
