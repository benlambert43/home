import { POST_HEADER_IMAGE_NAME, PostInlineImageRequest } from "@home/shared";
import {
  inlineImageNotAnImage,
  inlineImageTypeMismatch,
} from "../http/messages";
import { detectImageType } from "../storage/imageType";
import { PostFileContent } from "../storage/postStorage";

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

const extensionOf = (name: string) =>
  name.slice(name.lastIndexOf(".") + 1).toLowerCase();

type DecodedInlineImages =
  { ok: true; images: PostFileContent[] } | { ok: false; message: string };

export const decodeHeaderImage = (
  encoded: string,
): PostFileContent | undefined => {
  const data = Buffer.from(encoded, "base64");
  const imageType = detectImageType(data);

  return imageType
    ? {
        name: `${POST_HEADER_IMAGE_NAME}.${imageType.extension}`,
        contentType: imageType.contentType,
        data,
      }
    : undefined;
};

export const decodeInlineImages = (
  images: PostInlineImageRequest[],
): DecodedInlineImages => {
  const decoded: PostFileContent[] = [];

  for (const image of images) {
    const data = Buffer.from(image.data, "base64");
    const imageType = detectImageType(data);

    if (!imageType) {
      return { ok: false, message: inlineImageNotAnImage(image.name) };
    }

    if (
      EXTENSION_CONTENT_TYPES[extensionOf(image.name)] !== imageType.contentType
    ) {
      return { ok: false, message: inlineImageTypeMismatch(image.name) };
    }

    decoded.push({
      name: image.name,
      contentType: imageType.contentType,
      data,
    });
  }

  return { ok: true, images: decoded };
};
