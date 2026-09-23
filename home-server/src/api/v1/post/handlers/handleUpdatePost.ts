import { HydratedDocument, Error as MongooseError } from "mongoose";
import { Post, UpdatePostRequestBody, UpdatePostResponse } from "@home/shared";
import { ApiError } from "../../http/apiError";
import {
  ApiMessage,
  imageNameTaken,
  imageReferenceNotOnPost,
  inlineImageNotOnPost,
} from "../../http/messages";
import { PostModel } from "../../model/postModel";
import {
  deletePostRevision,
  reusePostThumbnails,
  writePostRevision,
} from "../../fileOperations/postStorage";
import {
  latestRevision,
  PostDocument,
  revisionImages,
  StoredPostFile,
  StoredPostImage,
  StoredPostRevision,
} from "../../types/db";
import { Decoded } from "../../types/decoded";
import { unmatchedImageReference } from "../postImageReferences";
import {
  collectPostUploadImages,
  discardPostUpload,
  PostUploadImages,
} from "../postUploads";
import { toPostResponse } from "../postResponse";
import { PostWrite, refusedPostWrite } from "../postThumbnails";
import { deleteUnsavedStorage } from "../unsavedStorage";

const usedImageName = (
  revisions: StoredPostRevision[],
  uploaded: StoredPostFile[],
) => {
  const used = new Set(
    revisions
      .flatMap((revision) => revisionImages(revision))
      .map((image) => image.name.toLowerCase()),
  );

  return uploaded.find((image) => used.has(image.name.toLowerCase()))?.name;
};

const resolveHeaderImage = (
  removed: null | undefined,
  uploaded: StoredPostImage | undefined,
  stored: StoredPostImage | undefined,
): Decoded<StoredPostImage | undefined> => {
  if (removed === null && uploaded) {
    return {
      ok: false,
      message: ApiMessage.POST_HEADER_IMAGE_REMOVED_AND_UPLOADED,
    };
  }

  if (removed === null) return { ok: true, value: undefined };

  return { ok: true, value: uploaded ?? stored };
};

const resolveInlineImages = (
  stored: StoredPostImage[],
  uploaded: StoredPostImage[],
  removed: string[],
): Decoded<StoredPostImage[]> => {
  const onPost = new Set(stored.map((image) => image.name));
  const missing = removed.find((name) => !onPost.has(name));

  if (missing) return { ok: false, message: inlineImageNotOnPost(missing) };

  const kept = stored.filter((image) => !removed.includes(image.name));

  return { ok: true, value: [...kept, ...uploaded] };
};

const saveEdit = async (
  post: HydratedDocument<PostDocument>,
  revision: StoredPostRevision,
): Promise<Post> => {
  try {
    const edited = await toPostResponse(post);

    await post.save();

    return edited;
  } catch (e) {
    await deleteUnsavedStorage(
      { _id: post._id, "revisions.fingerprint": revision.fingerprint },
      `revision ${revision.fingerprint} of post ${post.fingerprint}`,
      () => deletePostRevision(post.fingerprint, revision.fingerprint),
    );

    if (e instanceof MongooseError.VersionError) {
      throw new ApiError(ApiMessage.POST_CHANGED_DURING_UPDATE, 409, e.message);
    }

    throw e;
  }
};

const updatePost = async (
  postId: string,
  body: UpdatePostRequestBody,
  uploaded: PostUploadImages,
): Promise<PostWrite<UpdatePostResponse> | undefined> => {
  const post = await PostModel.findById(postId);
  if (!post) return undefined;

  const previous = latestRevision(post.revisions);

  if (previous?.fingerprint !== body.revision) {
    throw new ApiError(ApiMessage.POST_CHANGED_SINCE_LOADED, 409);
  }

  const used = usedImageName(post.revisions, revisionImages(uploaded));
  if (used) return refusedPostWrite(imageNameTaken(used));

  const headerImage = resolveHeaderImage(
    body.headerImage,
    uploaded.headerImage,
    previous?.headerImage,
  );
  if (!headerImage.ok) return refusedPostWrite(headerImage.message);

  const inlineImages = resolveInlineImages(
    previous?.inlineImages ?? [],
    uploaded.inlineImages,
    body.removeInlineImages ?? [],
  );
  if (!inlineImages.ok) return refusedPostWrite(inlineImages.message);

  const images = revisionImages({
    headerImage: headerImage.value,
    inlineImages: inlineImages.value,
  });

  const unmatched = unmatchedImageReference(body.content, images);
  if (unmatched) return refusedPostWrite(imageReferenceNotOnPost(unmatched));

  const revision = await writePostRevision(post.fingerprint, {
    content: body.content,
    headerImage: headerImage.value,
    inlineImages: inlineImages.value,
  });

  await reusePostThumbnails(post.fingerprint, revision, previous).catch(
    () => undefined,
  );

  post.revisions.push(revision);
  post.title = body.title;
  post.modifiedDate = new Date();

  const edited = await saveEdit(post, revision);

  if (body.uploadId !== undefined) await discardPostUpload(body.uploadId);

  return {
    response: { error: false, message: ApiMessage.POST_UPDATED, post: edited },
    thumbnails: { post: post.fingerprint, revision, previous },
  };
};

export const handleUpdatePost = async (
  postId: string,
  body: UpdatePostRequestBody,
): Promise<PostWrite<UpdatePostResponse> | undefined> => {
  if (body.uploadId === undefined) {
    return updatePost(postId, body, { inlineImages: [] });
  }

  const images = await collectPostUploadImages(body.uploadId);
  if (!images.ok) return refusedPostWrite(images.message);

  return updatePost(postId, body, images.value);
};
