import { PostThumbnailSize } from "@home/shared";
import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import {
  findStoredShareImage,
  findStoredThumbnail,
  storedFileTag,
} from "../../fileOperations/postStorage";
import { latestRevision, revisionImages, StoredPostFile } from "../../types/db";

export interface PostImageFile {
  file: string;
  contentType: string;
  etag: string;
}

interface CurrentImage {
  post: string;
  revision: string;
  image: StoredPostFile;
}

const SHARE_IMAGE_FALLBACK_SIZE: PostThumbnailSize = "large";

const findCurrentImage = async (
  slug: string,
  name: string,
): Promise<CurrentImage | undefined> => {
  const post = await PostModel.findOne({ slug }, CURRENT_REVISION_ONLY);
  const revision = post ? latestRevision(post.revisions) : undefined;
  const image = revision
    ? revisionImages(revision).find((candidate) => candidate.name === name)
    : undefined;

  return post && revision && image
    ? { post: post.fingerprint, revision: revision.fingerprint, image }
    : undefined;
};

const fullSizeImage = async (
  image: StoredPostFile,
): Promise<PostImageFile> => ({
  file: image.file,
  contentType: image.contentType,
  etag: await storedFileTag(image.file),
});

export const findPostImage = async (
  slug: string,
  name: string,
): Promise<PostImageFile | undefined> => {
  const found = await findCurrentImage(slug, name);

  return found && fullSizeImage(found.image);
};

const thumbnailOf = async (
  { post, revision, image }: CurrentImage,
  size: PostThumbnailSize,
): Promise<PostImageFile> => {
  const thumbnail = await findStoredThumbnail(post, revision, image.name, size);
  if (!thumbnail) return fullSizeImage(image);

  return {
    file: thumbnail.file,
    contentType: thumbnail.contentType,
    etag: await storedFileTag(thumbnail.file),
  };
};

export const findPostThumbnail = async (
  slug: string,
  name: string,
  size: PostThumbnailSize,
): Promise<PostImageFile | undefined> => {
  const found = await findCurrentImage(slug, name);

  return found && thumbnailOf(found, size);
};

export const findPostShareImage = async (
  slug: string,
  name: string,
): Promise<PostImageFile | undefined> => {
  const found = await findCurrentImage(slug, name);
  if (!found) return undefined;

  const shareImage = await findStoredShareImage(
    found.post,
    found.revision,
    found.image.name,
  );
  if (!shareImage) return thumbnailOf(found, SHARE_IMAGE_FALLBACK_SIZE);

  return { ...shareImage, etag: await storedFileTag(shareImage.file) };
};
