import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import { readPostFile } from "../../fileOperations/postStorage";
import { latestRevision, revisionImages, StoredPostFile } from "../../types/db";

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

export const findPostImage = async (
  postId: string,
  name: string,
): Promise<StoredPostImage | undefined> => {
  const revision = await currentRevision(postId);
  if (!revision) return undefined;

  const image = revisionImages(revision).find(
    (candidate) => candidate.name === name,
  );
  if (!image) return undefined;

  return { file: image, etag: `${revision.fingerprint}-${name}` };
};

export const handleGetPostImage = async (
  postId: string,
  name: string,
): Promise<PostImageFile | undefined> => {
  const image = await findPostImage(postId, name);
  if (!image) return undefined;

  return {
    data: await readPostFile(image.file),
    contentType: image.file.contentType,
    etag: image.etag,
  };
};
