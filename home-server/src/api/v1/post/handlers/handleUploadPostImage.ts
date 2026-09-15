import {
  CreatePostUploadRequestBody,
  postUploadImageNames,
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
  imageNotAnImage,
  imageNotInUpload,
  imageTypeMismatch,
} from "../../http/messages";
import { ReceivedPostImage } from "../uploadImage";

const failure = (message: string): UploadPostImageResponse => ({
  error: true,
  message,
});

export const handleUploadPostImage = async (
  uploadId: string,
  manifest: CreatePostUploadRequestBody,
  name: string,
  image: ReceivedPostImage | undefined,
): Promise<UploadPostImageResponse> => {
  if (!postUploadImageNames(manifest).includes(name)) {
    return failure(imageNotInUpload(name));
  }

  if (!image) return failure(ApiMessage.INVALID_REQUEST);

  const imageType = await detectFileImageType(image.path);
  if (!imageType) return failure(imageNotAnImage(name));

  if (contentTypeForName(name) !== imageType.contentType) {
    return failure(imageTypeMismatch(name));
  }

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
    },
  };
};
