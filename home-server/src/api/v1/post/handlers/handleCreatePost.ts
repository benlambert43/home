import { Types } from "mongoose";
import {
  CreatePostRequestBody,
  CreatePostResponse,
  UserNoPassword,
} from "@home/shared";
import { ApiMessage } from "../../http/messages";
import { PostModel } from "../../model/postModel";
import { fingerprint } from "../../storage/fingerprint";
import {
  deletePostStorage,
  writePostRevision,
} from "../../storage/postStorage";
import { serializePost } from "../../types/serialize";
import { decodePostImages } from "../postImages";

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
    await deletePostStorage(postFingerprint).catch((cleanupError: unknown) => {
      console.error(
        `Failed to clean up storage for post ${postFingerprint}:`,
        cleanupError,
      );
    });
    throw e;
  }
};
