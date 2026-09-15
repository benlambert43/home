import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import { readPostFile } from "../../fileOperations/postStorage";
import { latestRevision, StoredPostFile } from "../../types/db";

export interface PostImageFile {
  data: Buffer;
  contentType: string;
  etag: string;
}

export interface StoredPostImage {
  file: StoredPostFile;
  etag: string;
}

const currentRevision = async (postId: string) => {
  const post = await PostModel.findById(postId, CURRENT_REVISION_ONLY);

  return post ? latestRevision(post.revisions) : undefined;
};

const readImage = async (
  image: StoredPostImage | undefined,
): Promise<PostImageFile | undefined> => {
  if (!image) return undefined;

  return {
    data: await readPostFile(image.file),
    contentType: image.file.contentType,
    etag: image.etag,
  };
};

export const findPostHeaderImage = async (
  postId: string,
): Promise<StoredPostImage | undefined> => {
  const revision = await currentRevision(postId);
  if (!revision?.headerImage) return undefined;

  return { file: revision.headerImage, etag: revision.fingerprint };
};

export const findPostInlineImage = async (
  postId: string,
  name: string,
): Promise<StoredPostImage | undefined> => {
  const revision = await currentRevision(postId);
  if (!revision) return undefined;

  const image = revision.inlineImages.find(
    (candidate) => candidate.name === name,
  );
  if (!image) return undefined;

  return { file: image, etag: `${revision.fingerprint}-${name}` };
};

export const handleGetPostHeaderImage = async (postId: string) =>
  readImage(await findPostHeaderImage(postId));

export const handleGetPostInlineImage = async (postId: string, name: string) =>
  readImage(await findPostInlineImage(postId, name));
