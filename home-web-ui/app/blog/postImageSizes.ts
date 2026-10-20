import { CSSProperties } from "react";

const MAX_HEIGHT_REM = 21;
const LG_MAX_HEIGHT_REM = 28;
const LG_BREAKPOINT_PX = 1024;

type ImageDimensions = { width: number; height: number };

export type PostImageColumn = { minWidthPx: number; width: string };

const DEFAULT_COLUMNS: PostImageColumn[] = [
  { minWidthPx: 1280, width: "75vw" },
  { minWidthPx: LG_BREAKPOINT_PX, width: "100vw" },
];

export const POST_PAGE_IMAGE_COLUMNS: PostImageColumn[] = [
  { minWidthPx: 3008, width: "33vw" },
  { minWidthPx: 1536, width: "50vw" },
  { minWidthPx: LG_BREAKPOINT_PX, width: "75vw" },
];

const heightLimitedWidth = (
  { width, height }: ImageDimensions,
  maxHeightRem: number,
) => `${(maxHeightRem * width) / height}rem`;

export const postImageSizing = (
  image: ImageDimensions,
  columns = DEFAULT_COLUMNS,
) => {
  const maxWidth = heightLimitedWidth(image, MAX_HEIGHT_REM);
  const lgMaxWidth = heightLimitedWidth(image, LG_MAX_HEIGHT_REM);

  return {
    sizes: [
      ...columns.map(
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
