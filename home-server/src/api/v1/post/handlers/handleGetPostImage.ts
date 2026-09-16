import { PostThumbnailSize } from "@home/shared";
import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import { findStoredThumbnail } from "../../fileOperations/postStorage";
import { latestRevision, revisionImages, StoredPostFile } from "../../types/db";

export interface PostImageFile {
  file: string;
  contentType: string;
  etag: string;
}

const findCurrentImage = async (postId: string, name: string) => {
  const post = await PostModel.findById(postId, CURRENT_REVISION_ONLY);
  const revision = post ? latestRevision(post.revisions) : undefined;
  const image = revision
    ? revisionImages(revision).find((candidate) => candidate.name === name)
    : undefined;

  return post && revision && image
    ? { post: post.fingerprint, revision: revision.fingerprint, image }
    : undefined;
};

const fullSizeImage = (
  revision: string,
  image: StoredPostFile,
): PostImageFile => ({
  file: image.file,
  contentType: image.contentType,
  etag: `${revision}-${image.name}`,
});

export const findPostImage = async (
  postId: string,
  name: string,
): Promise<PostImageFile | undefined> => {
  const found = await findCurrentImage(postId, name);

  return found && fullSizeImage(found.revision, found.image);
};

export const findPostThumbnail = async (
  postId: string,
  name: string,
  size: PostThumbnailSize,
): Promise<PostImageFile | undefined> => {
  const found = await findCurrentImage(postId, name);
  if (!found) return undefined;

  const thumbnail = await findStoredThumbnail(
    found.post,
    found.revision,
    found.image.name,
    size,
  );
  if (!thumbnail) return fullSizeImage(found.revision, found.image);

  return {
    file: thumbnail.file,
    contentType: thumbnail.contentType,
    etag: `${found.revision}-${thumbnail.size}-${found.image.name}`,
  };
};
