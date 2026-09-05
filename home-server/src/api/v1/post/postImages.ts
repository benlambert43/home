import { POST_HEADER_IMAGE_NAME, PostInlineImageRequest } from "@home/shared";
import {
  ApiMessage,
  inlineImageNotAnImage,
  inlineImageTypeMismatch,
} from "../http/messages";
import { detectImageType } from "../fileOperations/imageType";
import { PostFileContent } from "../fileOperations/postStorage";

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

export type Decoded<Value> =
  { ok: true; value: Value } | { ok: false; message: string };

export interface PostImages {
  headerImage?: PostFileContent;
  inlineImages: PostFileContent[];
}

export const decodeHeaderImage = (
  encoded: string,
): Decoded<PostFileContent> => {
  const data = Buffer.from(encoded, "base64");
  const imageType = detectImageType(data);

  return imageType
    ? {
        ok: true,
        value: {
          name: `${POST_HEADER_IMAGE_NAME}.${imageType.extension}`,
          contentType: imageType.contentType,
          data,
        },
      }
    : { ok: false, message: ApiMessage.POST_IMAGE_INVALID };
};

export const decodeInlineImages = (
  images: PostInlineImageRequest[],
): Decoded<PostFileContent[]> => {
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

  return { ok: true, value: decoded };
};

export const decodePostImages = (
  header: string | undefined,
  inline: PostInlineImageRequest[],
): Decoded<PostImages> => {
  const headerImage =
    header === undefined
      ? ({ ok: true, value: undefined } as const)
      : decodeHeaderImage(header);

  if (!headerImage.ok) return headerImage;

  const inlineImages = decodeInlineImages(inline);
  if (!inlineImages.ok) return inlineImages;

  return {
    ok: true,
    value: {
      headerImage: headerImage.value,
      inlineImages: inlineImages.value,
    },
  };
};
