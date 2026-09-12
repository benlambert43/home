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
import { decodePostImages } from "../postImages";

const postMayExist = (_id: Types.ObjectId) =>
  PostModel.exists({ _id })
    .then((post) => post !== null)
    .catch(() => true);

export const handleCreatePost = async (
  author: UserNoPassword,
  body: CreatePostRequestBody,
): Promise<CreatePostResponse> => {
  const decoded = decodePostImages(body.headerImage, body.inlineImages);
  if (!decoded.ok) return { error: true, message: decoded.message };

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
          ...decoded.value,
        }),
      ],
    }).save();

    return {
      error: false,
      message: ApiMessage.POST_CREATED,
      post: serializePost(post, author.username, body.content),
    };
  } catch (e) {
    if (!(await postMayExist(_id))) {
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
