import { ApiResponse } from "@home/shared";
import { deletePostUpload } from "../fileOperations/uploadStorage";

export const discardPostUpload = (uploadId: string) =>
  deletePostUpload(uploadId).catch((e: unknown) => {
    console.error(`Failed to clean up upload ${uploadId}:`, e);
  });

export const discardPostUploadOnFailure = async <
  Result extends ApiResponse | undefined,
>(
  uploadId: string,
  attempt: () => Promise<Result>,
): Promise<Result> => {
  try {
    const result = await attempt();
    if (result?.error) await discardPostUpload(uploadId);

    return result;
  } catch (e) {
    await discardPostUpload(uploadId);
    throw e;
  }
};
