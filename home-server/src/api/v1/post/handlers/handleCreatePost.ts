import { Types } from "mongoose";
import {
  CreatePostRequestBody,
  CreatePostResponse,
  UserNoPassword,
} from "@home/shared";
import { ApiMessage } from "../../http/messages";
import { PostModel } from "../../model/postModel";
import { fingerprint } from "../../fileOperations/fingerprint";
import {
  deletePostStorage,
  writePostRevision,
} from "../../fileOperations/postStorage";
import { requireLatestRevision } from "../../types/db";
import { serializePost } from "../../types/serialize";
import {
  collectPostUploadImages,
  discardPostUpload,
  PostUploadImages,
} from "../postUploads";
import { PostWrite, refusedPostWrite } from "../postThumbnails";
import { deleteUnsavedStorage } from "../unsavedStorage";

const savePost = async (
  author: UserNoPassword,
  body: CreatePostRequestBody,
  images: PostUploadImages,
) => {
  const _id = new Types.ObjectId();
  const createdDate = new Date();
  const postFingerprint = fingerprint(
    _id.toHexString(),
    createdDate.toISOString(),
  );

  try {
    return await new PostModel({
      _id,
      title: body.title,
      fingerprint: postFingerprint,
      authorUserId: new Types.ObjectId(author._id),
      createdDate,
      modifiedDate: createdDate,
      revisions: [
        await writePostRevision(postFingerprint, {
          content: body.content,
          ...images,
        }),
      ],
    }).save();
  } catch (e) {
    await deleteUnsavedStorage({ _id }, `post ${postFingerprint}`, () =>
      deletePostStorage(postFingerprint),
    );
    throw e;
  }
};

const createPost = async (
  author: UserNoPassword,
  body: CreatePostRequestBody,
  images: PostUploadImages,
): Promise<PostWrite<CreatePostResponse>> => {
  const post = await savePost(author, body, images);
  const created: PostWrite<CreatePostResponse> = {
    response: {
      error: false,
      message: ApiMessage.POST_CREATED,
      post: serializePost(post, author.username, body.content),
    },
    thumbnails: {
      post: post.fingerprint,
      revision: requireLatestRevision(post),
    },
  };

  if (body.uploadId !== undefined) await discardPostUpload(body.uploadId);

  return created;
};

export const handleCreatePost = async (
  author: UserNoPassword,
  body: CreatePostRequestBody,
): Promise<PostWrite<CreatePostResponse>> => {
  if (body.uploadId === undefined) {
    return createPost(author, body, { inlineImages: [] });
  }

  const images = await collectPostUploadImages(body.uploadId);
  if (!images.ok) return refusedPostWrite(images.message);

  return createPost(author, body, images.value);
};
