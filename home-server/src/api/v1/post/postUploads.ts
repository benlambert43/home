import { POST_HEADER_IMAGE_NAME } from "@home/shared";
import {
  deletePostUpload,
  inspectStagedPostImage,
  listStagedPostImages,
  resumePostUpload,
} from "../fileOperations/uploadStorage";
import { ApiMessage, inlineImageNotAnImage } from "../http/messages";
import { StoredPostFile } from "../types/db";
import { Decoded } from "../types/decoded";

export interface PostUploadImages {
  headerImage?: StoredPostFile;
  inlineImages: StoredPostFile[];
}

const postImageName = (stagedName: string, extension: string) =>
  stagedName === POST_HEADER_IMAGE_NAME
    ? `${POST_HEADER_IMAGE_NAME}.${extension}`
    : stagedName;

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

  const expected = manifest.headerImage
    ? [POST_HEADER_IMAGE_NAME, ...manifest.inlineImages]
    : manifest.inlineImages;
  const staged = await listStagedPostImages(uploadId);

  if (!expected.every((name) => staged.includes(name))) {
    return { ok: false, message: ApiMessage.POST_UPLOAD_INCOMPLETE };
  }

  const collected: StoredPostFile[] = [];

  for (const stagedName of expected) {
    const { stagedFile, byteSize, imageType } = await inspectStagedPostImage(
      uploadId,
      stagedName,
    );
    if (!imageType) {
      return { ok: false, message: inlineImageNotAnImage(stagedName) };
    }

    collected.push({
      name: postImageName(stagedName, imageType.extension),
      file: stagedFile,
      contentType: imageType.contentType,
      byteSize,
    });
  }

  return {
    ok: true,
    value: {
      headerImage: manifest.headerImage ? collected[0] : undefined,
      inlineImages: collected.slice(manifest.headerImage ? 1 : 0),
    },
  };
};
