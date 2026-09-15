import {
  CreatePostUploadRequestBody,
  CreatePostUploadResponse,
} from "@home/shared";
import { ApiMessage } from "../../http/messages";
import {
  createPostUpload,
  deleteExpiredPostUploads,
  deletePostUpload,
  newPostUploadId,
} from "../../fileOperations/uploadStorage";

export const handleCreatePostUpload = async (
  manifest: CreatePostUploadRequestBody,
): Promise<CreatePostUploadResponse> => {
  await deleteExpiredPostUploads();

  const uploadId = newPostUploadId();

  try {
    await createPostUpload(uploadId, manifest);
  } catch (e) {
    await deletePostUpload(uploadId).catch((cleanupError: unknown) => {
      console.error(`Failed to clean up upload ${uploadId}:`, cleanupError);
    });
    throw e;
  }

  return { error: false, message: ApiMessage.POST_UPLOAD_STARTED, uploadId };
};
