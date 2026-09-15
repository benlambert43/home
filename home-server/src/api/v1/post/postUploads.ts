import {
  ApiResponse,
  POST_HEADER_IMAGE_NAME,
  postUploadParamsSchema,
} from "@home/shared";
import { StagedPostFile } from "../fileOperations/postStorage";
import {
  deletePostUpload,
  inspectStagedPostImage,
  listStagedPostImages,
  readPostUploadManifest,
} from "../fileOperations/uploadStorage";
import { ApiMessage, inlineImageNotAnImage } from "../http/messages";
import { Decoded } from "../types/decoded";

export interface PostUploadImages {
  headerImage?: StagedPostFile;
  inlineImages: StagedPostFile[];
}

const isHeaderImage = (name: string) =>
  name.startsWith(`${POST_HEADER_IMAGE_NAME}.`);

export const discardPostUpload = (uploadId: string) =>
  deletePostUpload(uploadId).catch((e: unknown) => {
    console.error(`Failed to clean up upload ${uploadId}:`, e);
  });

export const discardPostUploadIn = async (body: unknown) => {
  const upload = postUploadParamsSchema.safeParse(body);
  if (upload.success) await discardPostUpload(upload.data.uploadId);
};

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

export const collectPostUploadImages = async (
  uploadId: string,
): Promise<Decoded<PostUploadImages>> => {
  const manifest = await readPostUploadManifest(uploadId);
  if (!manifest) {
    return { ok: false, message: ApiMessage.POST_UPLOAD_NOT_FOUND };
  }

  const staged = await listStagedPostImages(uploadId);
  const headerImages = staged.filter(isHeaderImage);
  const expected = [...headerImages, ...manifest.inlineImages];

  if (
    headerImages.length !== (manifest.headerImage ? 1 : 0) ||
    staged.length !== expected.length ||
    !manifest.inlineImages.every((name) => staged.includes(name))
  ) {
    return { ok: false, message: ApiMessage.POST_UPLOAD_INCOMPLETE };
  }

  const collected: StagedPostFile[] = [];

  for (const name of expected) {
    const { stagedFile, byteSize, imageType } = await inspectStagedPostImage(
      uploadId,
      name,
    );
    if (!imageType) return { ok: false, message: inlineImageNotAnImage(name) };

    collected.push({
      name,
      contentType: imageType.contentType,
      byteSize,
      stagedFile,
    });
  }

  return {
    ok: true,
    value: {
      headerImage: manifest.headerImage ? collected[0] : undefined,
      inlineImages: collected.slice(headerImages.length),
    },
  };
};
