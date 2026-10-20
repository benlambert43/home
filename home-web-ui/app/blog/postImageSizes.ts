import { POST_COLUMN_WIDTHS } from "@/app/blog/postColumn";
import { CSSProperties } from "react";

const MAX_HEIGHT_REM = 21;
const LG_MAX_HEIGHT_REM = 28;

type ImageDimensions = { width: number; height: number };

const heightLimitedWidth = (
  { width, height }: ImageDimensions,
  maxHeightRem: number,
) => `${(maxHeightRem * width) / height}rem`;

export const postImageSizing = (image: ImageDimensions) => {
  const maxWidth = heightLimitedWidth(image, MAX_HEIGHT_REM);
  const lgMaxWidth = heightLimitedWidth(image, LG_MAX_HEIGHT_REM);

  return {
    sizes: [
      ...POST_COLUMN_WIDTHS.map(
        ({ minWidthPx, width }) =>
          `(min-width: ${minWidthPx}px) min(${width}, ${image.width}px, ${lgMaxWidth})`,
      ),
      `min(100vw, ${image.width}px, ${maxWidth})`,
    ].join(", "),
    className:
      "mx-auto h-auto max-w-(--max-width) rounded-md lg:max-w-(--lg-max-width)",
    style: {
      "--max-width": `min(100%, ${maxWidth})`,
      "--lg-max-width": `min(100%, ${lgMaxWidth})`,
      aspectRatio: `${image.width} / ${image.height}`,
    } as CSSProperties,
  };
};
