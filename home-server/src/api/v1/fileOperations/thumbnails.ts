import sharp from "sharp";
import { readImageFrame } from "./imageDimensions";
import { isAnimatedPngOrAvifSequence } from "./imageType";

const MAX_DECODED_PIXELS = 2 ** 32;

const TIME_LIMIT_MILLISECONDS = 60 * 1000;

const WEBP_MAX_DIMENSION = 16383;

const MIN_ANIMATED_EDGE = 64;

const BITS_PER_BYTE = 8;

const ESTIMATED_BITS_PER_PIXEL = 2;

const QUALITIES = [80, 60, 40];

const SHRINK_FACTOR = 0.75;

interface Box {
  width: number;
  height: number;
}

interface SourceImage {
  file: string;
  byteSize: number;
  frame: Box;
  animated: boolean;
  deadline: number;
}

const readSource = async (
  file: string,
  byteSize: number,
): Promise<SourceImage> => {
  const { frame, animated } = await readImageFrame(file, MAX_DECODED_PIXELS);

  return {
    file,
    byteSize,
    frame,
    animated,
    deadline: Date.now() + TIME_LIMIT_MILLISECONDS,
  };
};

const scaledBox = ({ width, height }: Box, scale: number): Box => ({
  width: Math.max(1, Math.floor(width * scale)),
  height: Math.max(1, Math.floor(height * scale)),
});

const atLeast = (box: Box, smallest: Box): Box => ({
  width: Math.max(box.width, smallest.width),
  height: Math.max(box.height, smallest.height),
});

const largestBox = (
  { frame, byteSize, animated }: SourceImage,
  maxBytes: number,
): Box => {
  const pixelBudget = (maxBytes * BITS_PER_BYTE) / ESTIMATED_BITS_PER_PIXEL;

  return scaledBox(
    frame,
    Math.min(
      1,
      Math.sqrt(pixelBudget / (frame.width * frame.height)),
      animated ? Math.sqrt(maxBytes / byteSize) : 1,
      WEBP_MAX_DIMENSION / frame.width,
      WEBP_MAX_DIMENSION / frame.height,
    ),
  );
};

const smallestBox = ({ frame, animated }: SourceImage): Box =>
  animated
    ? scaledBox(
        frame,
        Math.min(1, MIN_ANIMATED_EDGE / Math.max(frame.width, frame.height)),
      )
    : { width: 1, height: 1 };

const shrink = (box: Box, smallest: Box): Box | undefined =>
  box.width <= smallest.width && box.height <= smallest.height
    ? undefined
    : atLeast(scaledBox(box, SHRINK_FACTOR), smallest);

const secondsLeft = ({ file, deadline }: SourceImage) => {
  const seconds = Math.ceil((deadline - Date.now()) / 1000);
  if (seconds <= 0) throw new Error(`Ran out of time resizing ${file}.`);

  return seconds;
};

const encode = async (source: SourceImage, box: Box, quality: number) => {
  const image = sharp(source.file, {
    animated: source.animated,
    limitInputPixels: MAX_DECODED_PIXELS,
  });

  return (source.animated ? image : image.autoOrient())
    .timeout({ seconds: secondsLeft(source) })
    .resize({ ...box, fit: "inside" })
    .webp({ quality })
    .toBuffer();
};

const keepsAnimation = async ({ animated }: SourceImage, data: Buffer) =>
  !animated || ((await sharp(data).metadata()).pages ?? 1) > 1;

const encodeWithin = async (
  source: SourceImage,
  box: Box,
  maxBytes: number,
) => {
  for (const quality of QUALITIES) {
    const data = await encode(source, box, quality);

    if (data.byteLength <= maxBytes && (await keepsAnimation(source, data))) {
      return data;
    }
  }

  return undefined;
};

const fitsAtSmallest = async (
  source: SourceImage,
  smallest: Box,
  maxBytes: number,
) => {
  for (const quality of [...QUALITIES].reverse()) {
    const data = await encode(source, smallest, quality);
    if (data.byteLength > maxBytes) return false;
    if (await keepsAnimation(source, data)) return true;
  }

  return false;
};

export const createThumbnail = async (
  file: string,
  byteSize: number,
  maxBytes: number,
): Promise<Buffer | undefined> => {
  if (byteSize <= maxBytes || (await isAnimatedPngOrAvifSequence(file))) {
    return undefined;
  }

  const source = await readSource(file, byteSize);
  const smallest = smallestBox(source);

  if (source.animated && !(await fitsAtSmallest(source, smallest, maxBytes))) {
    return undefined;
  }

  let box: Box | undefined = atLeast(largestBox(source, maxBytes), smallest);

  while (box) {
    const data = await encodeWithin(source, box, maxBytes);
    if (data) return data;

    box = shrink(box, smallest);
  }

  throw new Error(`Could not fit ${file} into ${maxBytes} bytes.`);
};
