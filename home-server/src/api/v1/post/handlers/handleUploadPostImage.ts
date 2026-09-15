import {
  CreatePostUploadRequestBody,
  POST_HEADER_IMAGE_NAME,
  UploadPostImageResponse,
} from "@home/shared";
import {
  contentTypeForName,
  detectFileImageType,
} from "../../fileOperations/imageType";
import { stagePostImage } from "../../fileOperations/uploadStorage";
import {
  ApiMessage,
  imageAlreadyUploaded,
  inlineImageNotAnImage,
  inlineImageNotInUpload,
  inlineImageTypeMismatch,
} from "../../http/messages";
import { ReceivedPostImage } from "../uploadImage";

const failure = (message: string): UploadPostImageResponse => ({
  error: true,
  message,
});

const stageImage = async (
  uploadId: string,
  image: ReceivedPostImage,
  stagedName: string,
  name: string,
  contentType: string,
): Promise<UploadPostImageResponse> => {
  if (!(await stagePostImage(uploadId, stagedName, image.path))) {
    return failure(imageAlreadyUploaded(stagedName));
  }

  return {
    error: false,
    message: ApiMessage.POST_IMAGE_UPLOADED,
    image: { name, contentType, byteSize: image.byteSize },
  };
};

export const handleUploadPostHeaderImage = async (
  uploadId: string,
  manifest: CreatePostUploadRequestBody,
  image: ReceivedPostImage | undefined,
): Promise<UploadPostImageResponse> => {
  if (!manifest.headerImage) {
    return failure(ApiMessage.POST_UPLOAD_HAS_NO_HEADER_IMAGE);
  }

  if (!image) return failure(ApiMessage.INVALID_REQUEST);

  const imageType = await detectFileImageType(image.path);
  if (!imageType) return failure(ApiMessage.POST_IMAGE_INVALID);

  return stageImage(
    uploadId,
    image,
    POST_HEADER_IMAGE_NAME,
    `${POST_HEADER_IMAGE_NAME}.${imageType.extension}`,
    imageType.contentType,
  );
};

export const handleUploadPostInlineImage = async (
  uploadId: string,
  manifest: CreatePostUploadRequestBody,
  name: string,
  image: ReceivedPostImage | undefined,
): Promise<UploadPostImageResponse> => {
  if (!manifest.inlineImages.includes(name)) {
    return failure(inlineImageNotInUpload(name));
  }

  if (!image) return failure(ApiMessage.INVALID_REQUEST);

  const imageType = await detectFileImageType(image.path);
  if (!imageType) return failure(inlineImageNotAnImage(name));

  if (contentTypeForName(name) !== imageType.contentType) {
    return failure(inlineImageTypeMismatch(name));
  }

  return stageImage(uploadId, image, name, name, imageType.contentType);
};
