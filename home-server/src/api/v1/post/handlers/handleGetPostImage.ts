import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import { readPostFile } from "../../storage/postStorage";
import { latestRevision } from "../../types/db";

export interface PostImageFile {
  data: Buffer;
  contentType: string;
  etag: string;
}

const currentRevision = async (postId: string) => {
  const post = await PostModel.findById(postId, CURRENT_REVISION_ONLY);

  return post ? latestRevision(post.revisions) : undefined;
};

export const handleGetPostHeaderImage = async (
  postId: string,
): Promise<PostImageFile | undefined> => {
  const revision = await currentRevision(postId);
  if (!revision?.headerImage) return undefined;

  return {
    data: await readPostFile(revision.headerImage),
    contentType: revision.headerImage.contentType,
    etag: revision.fingerprint,
  };
};

export const handleGetPostInlineImage = async (
  postId: string,
  name: string,
): Promise<PostImageFile | undefined> => {
  const revision = await currentRevision(postId);
  if (!revision) return undefined;

  const image = revision.inlineImages.find(
    (candidate) => candidate.name === name,
  );
  if (!image) return undefined;

  return {
    data: await readPostFile(image),
    contentType: image.contentType,
    etag: `${revision.fingerprint}-${name}`,
  };
};
