import {
  deletePostUpload,
  readPostUploadManifest,
} from "../../fileOperations/uploadStorage";

export const handleDeletePostUpload = async (
  uploadId: string,
): Promise<boolean> => {
  if (!(await readPostUploadManifest(uploadId))) return false;

  await deletePostUpload(uploadId);

  return true;
};
