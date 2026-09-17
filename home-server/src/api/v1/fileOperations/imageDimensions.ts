import sharp from "sharp";

export interface ImageDimensions {
  width: number;
  height: number;
}

export const readImageFrame = async (
  file: string,
  limitInputPixels: number | false,
) => {
  const metadata = await sharp(file, { limitInputPixels }).metadata();
  const animated = (metadata.pages ?? 1) > 1;
  const { width, height } = animated ? metadata : metadata.autoOrient;
  const frame: ImageDimensions = { width, height };

  return { frame, animated };
};

export const readImageDimensions = (
  file: string,
): Promise<ImageDimensions | undefined> =>
  readImageFrame(file, false).then(
    ({ frame }) => frame,
    () => undefined,
  );
