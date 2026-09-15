import { postUploadImageNames } from "@home/shared";
import {
  deletePostUpload,
  inspectStagedPostImage,
  listStagedPostImages,
  resumePostUpload,
} from "../fileOperations/uploadStorage";
import { ApiMessage, imageNotAnImage } from "../http/messages";
import { StoredPostFile } from "../types/db";
import { Decoded } from "../types/decoded";

export interface PostUploadImages {
  headerImage?: StoredPostFile;
  inlineImages: StoredPostFile[];
}

export const discardPostUpload = (uploadId: string) =>
  deletePostUpload(uploadId).catch((e: unknown) => {
    console.error(`Failed to clean up upload ${uploadId}:`, e);
  });

export const discardPostUploadOnFailure = async <Result>(
  uploadId: string,
  attempt: () => Promise<Result>,
): Promise<Result> => {
  try {
    return await attempt();
  } catch (e) {
    await discardPostUpload(uploadId);
    throw e;
  }
};

export const collectPostUploadImages = async (
  uploadId: string,
): Promise<Decoded<PostUploadImages>> => {
  const manifest = await resumePostUpload(uploadId);
  if (!manifest) {
    return { ok: false, message: ApiMessage.POST_UPLOAD_NOT_FOUND };
  }

  const expected = postUploadImageNames(manifest);
  const staged = await listStagedPostImages(uploadId);

  if (!expected.every((name) => staged.includes(name))) {
    return { ok: false, message: ApiMessage.POST_UPLOAD_INCOMPLETE };
  }

  const collected: StoredPostFile[] = [];

  for (const name of expected) {
    const { stagedFile, byteSize, imageType } = await inspectStagedPostImage(
      uploadId,
      name,
    );
    if (!imageType) return { ok: false, message: imageNotAnImage(name) };

    collected.push({
      name,
      file: stagedFile,
      contentType: imageType.contentType,
      byteSize,
    });
  }

  const hasHeaderImage = manifest.headerImage !== undefined;

  return {
    ok: true,
    value: {
      headerImage: hasHeaderImage ? collected[0] : undefined,
      inlineImages: collected.slice(hasHeaderImage ? 1 : 0),
    },
  };
};
