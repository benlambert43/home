import { CSSProperties } from "react";

const MAX_HEIGHT_REM = 27;
const XL_MAX_HEIGHT_REM = 36;

type ImageDimensions = { width: number; height: number };

const heightLimitedWidth = (
  { width, height }: ImageDimensions,
  maxHeightRem: number,
) => `${(maxHeightRem * width) / height}rem`;

export const postImageSizing = (image: ImageDimensions) => {
  const maxWidth = heightLimitedWidth(image, MAX_HEIGHT_REM);
  const xlMaxWidth = heightLimitedWidth(image, XL_MAX_HEIGHT_REM);

  return {
    sizes: `(min-width: 1280px) min(75vw, ${image.width}px, ${xlMaxWidth}), min(100vw, ${image.width}px, ${maxWidth})`,
    className:
      "mx-auto h-auto max-w-(--max-width) rounded-md xl:max-w-(--xl-max-width)",
    style: {
      "--max-width": `min(100%, ${maxWidth})`,
      "--xl-max-width": `min(100%, ${xlMaxWidth})`,
      aspectRatio: `${image.width} / ${image.height}`,
    } as CSSProperties,
  };
};
