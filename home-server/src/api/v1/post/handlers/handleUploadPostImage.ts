import { postImageContentType, UploadPostImageResponse } from "@home/shared";
import { readImageDimensions } from "../../fileOperations/imageDimensions";
import { detectFileImageType } from "../../fileOperations/imageType";
import { stagePostImage } from "../../fileOperations/uploadStorage";
import {
  ApiMessage,
  imageAlreadyUploaded,
  imageNotAnImage,
  imageTypeMismatch,
} from "../../http/messages";
import { ReceivedPostImage } from "../uploadImage";

const failure = (message: string): UploadPostImageResponse => ({
  error: true,
  message,
});

export const handleUploadPostImage = async (
  uploadId: string,
  name: string,
  image: ReceivedPostImage | undefined,
): Promise<UploadPostImageResponse> => {
  if (!image) return failure(ApiMessage.INVALID_REQUEST);

  const imageType = await detectFileImageType(image.path);
  if (!imageType) return failure(imageNotAnImage(name));

  if (postImageContentType(name) !== imageType.contentType) {
    return failure(imageTypeMismatch(name));
  }

  const dimensions = await readImageDimensions(image.path);
  if (!dimensions) return failure(imageNotAnImage(name));

  if (!(await stagePostImage(uploadId, name, image.path))) {
    return failure(imageAlreadyUploaded(name));
  }

  return {
    error: false,
    message: ApiMessage.POST_IMAGE_UPLOADED,
    image: {
      name,
      contentType: imageType.contentType,
      byteSize: image.byteSize,
      width: dimensions.width,
      height: dimensions.height,
    },
  };
};
