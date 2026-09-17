import { postUploadImageNames } from "@home/shared";
import {
  deletePostUpload,
  inspectStagedPostImage,
  listStagedPostImages,
  resumePostUpload,
} from "../fileOperations/uploadStorage";
import { ApiMessage, imageNotAnImage } from "../http/messages";
import { StoredPostImage } from "../types/db";
import { Decoded } from "../types/decoded";

export interface PostUploadImages {
  headerImage?: StoredPostImage;
  inlineImages: StoredPostImage[];
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

  const collected: StoredPostImage[] = [];

  for (const name of expected) {
    const { stagedFile, byteSize, imageType, dimensions } =
      await inspectStagedPostImage(uploadId, name);
    if (!imageType || !dimensions) {
      return { ok: false, message: imageNotAnImage(name) };
    }

    collected.push({
      name,
      file: stagedFile,
      contentType: imageType.contentType,
      byteSize,
      width: dimensions.width,
      height: dimensions.height,
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
