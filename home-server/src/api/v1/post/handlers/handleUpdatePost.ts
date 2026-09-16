import { HydratedDocument, Error as MongooseError } from "mongoose";
import { Post, UpdatePostRequestBody, UpdatePostResponse } from "@home/shared";
import { ApiError } from "../../http/apiError";
import {
  ApiMessage,
  imageNameTaken,
  inlineImageNotOnPost,
} from "../../http/messages";
import { PostModel } from "../../model/postModel";
import {
  deletePostRevision,
  writePostRevision,
} from "../../fileOperations/postStorage";
import {
  PostDocument,
  requireLatestRevision,
  revisionImages,
  StoredPostFile,
  StoredPostRevision,
} from "../../types/db";
import { Decoded } from "../../types/decoded";
import {
  collectPostUploadImages,
  discardPostUpload,
  PostUploadImages,
} from "../postUploads";
import { toPostResponse } from "../postResponse";
import { PostWrite, refusedPostWrite } from "../postThumbnails";
import { deleteUnsavedStorage } from "../unsavedStorage";

const namesInLowercase = (names: string[]) =>
  new Set(names.map((name) => name.toLowerCase()));

const resolveHeaderImage = (
  removed: null | undefined,
  uploaded: StoredPostFile | undefined,
  stored: StoredPostFile | undefined,
): Decoded<StoredPostFile | undefined> => {
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
  stored: StoredPostFile[],
  uploaded: StoredPostFile[],
  removed: string[],
): Decoded<StoredPostFile[]> => {
  const onPost = namesInLowercase(stored.map((image) => image.name));
  const missing = removed.find((name) => !onPost.has(name.toLowerCase()));

  if (missing) return { ok: false, message: inlineImageNotOnPost(missing) };

  const dropped = namesInLowercase([
    ...uploaded.map((image) => image.name),
    ...removed,
  ]);
  const kept = stored.filter((image) => !dropped.has(image.name.toLowerCase()));

  return { ok: true, value: [...kept, ...uploaded] };
};

const duplicateImageName = (images: StoredPostFile[]) => {
  const names = images.map((image) => image.name.toLowerCase());

  return images.find(
    (image, index) => names.indexOf(image.name.toLowerCase()) !== index,
  )?.name;
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

  const previous = requireLatestRevision(post);

  const headerImage = resolveHeaderImage(
    body.headerImage,
    uploaded.headerImage,
    previous.headerImage,
  );
  if (!headerImage.ok) return refusedPostWrite(headerImage.message);

  const inlineImages = resolveInlineImages(
    previous.inlineImages,
    uploaded.inlineImages,
    body.removeInlineImages ?? [],
  );
  if (!inlineImages.ok) return refusedPostWrite(inlineImages.message);

  const duplicate = duplicateImageName(
    revisionImages({
      headerImage: headerImage.value,
      inlineImages: inlineImages.value,
    }),
  );
  if (duplicate) return refusedPostWrite(imageNameTaken(duplicate));

  const revision = await writePostRevision(post.fingerprint, {
    content: body.content ?? previous.content,
    headerImage: headerImage.value,
    inlineImages: inlineImages.value,
  });

  post.revisions.push(revision);

  if (body.title !== undefined) post.title = body.title;

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
