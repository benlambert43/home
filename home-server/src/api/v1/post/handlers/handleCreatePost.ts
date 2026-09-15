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
import { serializePost } from "../../types/serialize";
import {
  collectPostUploadImages,
  discardPostUpload,
  PostUploadImages,
} from "../postUploads";
import { deleteUnsavedStorage } from "../unsavedStorage";

const createPost = async (
  author: UserNoPassword,
  body: CreatePostRequestBody,
  images: PostUploadImages,
): Promise<CreatePostResponse> => {
  const _id = new Types.ObjectId();
  const createdDate = new Date();
  const postFingerprint = fingerprint(
    _id.toHexString(),
    createdDate.toISOString(),
  );

  try {
    const post = await new PostModel({
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

    return {
      error: false,
      message: ApiMessage.POST_CREATED,
      post: serializePost(post, author.username, body.content),
    };
  } catch (e) {
    await deleteUnsavedStorage({ _id }, `post ${postFingerprint}`, () =>
      deletePostStorage(postFingerprint),
    );
    throw e;
  }
};

export const handleCreatePost = async (
  author: UserNoPassword,
  body: CreatePostRequestBody,
): Promise<CreatePostResponse> => {
  if (body.uploadId === undefined) {
    return createPost(author, body, { inlineImages: [] });
  }

  try {
    const images = await collectPostUploadImages(body.uploadId);
    if (!images.ok) return { error: true, message: images.message };

    return await createPost(author, body, images.value);
  } finally {
    await discardPostUpload(body.uploadId);
  }
};
