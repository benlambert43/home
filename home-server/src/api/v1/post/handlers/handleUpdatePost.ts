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
  readPostContent,
  writePostRevision,
} from "../../fileOperations/postStorage";
import {
  latestRevision,
  PostDocument,
  revisionImages,
  StoredPostFile,
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

interface EditedContent {
  markdown: string;
  stored: string | StoredPostFile;
}

const resolveContent = async (
  edited: string | undefined,
  previous: StoredPostRevision | undefined,
): Promise<Decoded<EditedContent>> => {
  if (edited !== undefined) {
    return { ok: true, value: { markdown: edited, stored: edited } };
  }

  if (!previous) {
    return { ok: false, message: ApiMessage.POST_CONTENT_REQUIRED };
  }

  return {
    ok: true,
    value: {
      markdown: await readPostContent(previous),
      stored: previous.content,
    },
  };
};

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
  const onPost = new Set(stored.map((image) => image.name));
  const missing = removed.find((name) => !onPost.has(name));

  if (missing) return { ok: false, message: inlineImageNotOnPost(missing) };

  const dropped = new Set([...uploaded.map((image) => image.name), ...removed]);
  const kept = stored.filter((image) => !dropped.has(image.name));

  return { ok: true, value: [...kept, ...uploaded] };
};

const sameName = (first: StoredPostFile, second: StoredPostFile) =>
  first.name.toLowerCase() === second.name.toLowerCase();

const takenImageName = (images: StoredPostFile[], uploaded: StoredPostFile[]) =>
  images.find((image) =>
    uploaded.some((added) => added !== image && sameName(added, image)),
  )?.name;

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

  const content = await resolveContent(body.content, previous);
  if (!content.ok) return refusedPostWrite(content.message);

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

  const taken = takenImageName(images, revisionImages(uploaded));
  if (taken) return refusedPostWrite(imageNameTaken(taken));

  const unmatched = unmatchedImageReference(content.value.markdown, images);
  if (unmatched) return refusedPostWrite(imageReferenceNotOnPost(unmatched));

  const revision = await writePostRevision(post.fingerprint, {
    content: content.value.stored,
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
