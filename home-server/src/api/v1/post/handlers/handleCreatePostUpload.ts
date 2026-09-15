import {
  CreatePostUploadRequestBody,
  CreatePostUploadResponse,
} from "@home/shared";
import { ApiMessage } from "../../http/messages";
import {
  createPostUpload,
  deleteIdlePostUploads,
  newPostUploadId,
} from "../../fileOperations/uploadStorage";
import { discardPostUploadOnFailure } from "../postUploads";

export const handleCreatePostUpload = async (
  manifest: CreatePostUploadRequestBody,
): Promise<CreatePostUploadResponse> => {
  await deleteIdlePostUploads();

  const uploadId = newPostUploadId();

  return discardPostUploadOnFailure(
    uploadId,
    async (): Promise<CreatePostUploadResponse> => {
      await createPostUpload(uploadId, manifest);

      return {
        error: false,
        message: ApiMessage.POST_UPLOAD_STARTED,
        uploadId,
      };
    },
  );
};
