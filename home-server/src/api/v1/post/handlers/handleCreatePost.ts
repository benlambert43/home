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

const postMayExist = (_id: Types.ObjectId, postFingerprint: string) =>
  PostModel.exists({ _id })
    .then((post) => post !== null)
    .catch((lookupError: unknown) => {
      console.error(
        `Kept storage for post ${postFingerprint}, MongoDB could not confirm the post was not saved:`,
        lookupError,
      );
      return true;
    });

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
    if (!(await postMayExist(_id, postFingerprint))) {
      await deletePostStorage(postFingerprint).catch(
        (cleanupError: unknown) => {
          console.error(
            `Failed to clean up storage for post ${postFingerprint}:`,
            cleanupError,
          );
        },
      );
    }
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
