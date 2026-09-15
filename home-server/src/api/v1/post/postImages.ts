import { POST_HEADER_IMAGE_NAME, PostInlineImageRequest } from "@home/shared";
import {
  ApiMessage,
  inlineImageNotAnImage,
  inlineImageTypeMismatch,
} from "../http/messages";
import {
  contentTypeForName,
  detectImageType,
} from "../fileOperations/imageType";
import { PostFileContent } from "../fileOperations/postStorage";
import { Decoded } from "../types/decoded";

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

    if (contentTypeForName(image.name) !== imageType.contentType) {
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
