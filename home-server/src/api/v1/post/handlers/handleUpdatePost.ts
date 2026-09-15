import { UpdatePostRequestBody, UpdatePostResponse } from "@home/shared";
import { ApiMessage, inlineImageNotOnPost } from "../../http/messages";
import { PostModel } from "../../model/postModel";
import {
  deletePostRevision,
  PostFileSource,
  StagedPostFile,
  writePostRevision,
} from "../../fileOperations/postStorage";
import { requireLatestRevision, StoredPostFile } from "../../types/db";
import { Decoded } from "../../types/decoded";
import {
  collectPostUploadImages,
  discardPostUpload,
  PostUploadImages,
} from "../postUploads";
import { toPostResponse } from "../postResponse";
import { deleteUnsavedStorage } from "../unsavedStorage";

const namesInLowercase = (names: string[]) =>
  new Set(names.map((name) => name.toLowerCase()));

const resolveHeaderImage = (
  removed: null | undefined,
  uploaded: StagedPostFile | undefined,
  stored: StoredPostFile | undefined,
): Decoded<PostFileSource | undefined> => {
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
  uploaded: StagedPostFile[],
  removed: string[],
): Decoded<PostFileSource[]> => {
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

const updatePost = async (
  postId: string,
  body: UpdatePostRequestBody,
  uploaded: PostUploadImages,
): Promise<UpdatePostResponse | undefined> => {
  const post = await PostModel.findById(postId);
  if (!post) return undefined;

  const previous = requireLatestRevision(post);

  const headerImage = resolveHeaderImage(
    body.headerImage,
    uploaded.headerImage,
    previous.headerImage,
  );
  if (!headerImage.ok) return { error: true, message: headerImage.message };

  const inlineImages = resolveInlineImages(
    previous.inlineImages,
    uploaded.inlineImages,
    body.removeInlineImages ?? [],
  );
  if (!inlineImages.ok) return { error: true, message: inlineImages.message };

  const revision = await writePostRevision(post.fingerprint, {
    content: body.content ?? previous.content,
    headerImage: headerImage.value,
    inlineImages: inlineImages.value,
  });

  post.revisions.push(revision);

  if (body.title !== undefined) post.title = body.title;

  post.modifiedDate = new Date();

  try {
    await post.save();
  } catch (e) {
    await deleteUnsavedStorage(
      { _id: post._id, "revisions.fingerprint": revision.fingerprint },
      `revision ${revision.fingerprint} of post ${post.fingerprint}`,
      () => deletePostRevision(post.fingerprint, revision.fingerprint),
    );
    throw e;
  }

  return {
    error: false,
    message: ApiMessage.POST_UPDATED,
    post: await toPostResponse(post),
  };
};

export const handleUpdatePost = async (
  postId: string,
  body: UpdatePostRequestBody,
): Promise<UpdatePostResponse | undefined> => {
  if (body.uploadId === undefined) {
    return updatePost(postId, body, { inlineImages: [] });
  }

  try {
    const images = await collectPostUploadImages(body.uploadId);
    if (!images.ok) return { error: true, message: images.message };

    return await updatePost(postId, body, images.value);
  } finally {
    await discardPostUpload(body.uploadId);
  }
};
