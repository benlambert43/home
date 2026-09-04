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
import { decodeHeaderImage, decodeInlineImages } from "../postImages";

export const handleCreatePost = async (
  author: UserNoPassword,
  body: CreatePostRequestBody,
): Promise<CreatePostResponse> => {
  const headerImage = decodeHeaderImage(body.headerImage);
  if (!headerImage) {
    return { error: true, message: ApiMessage.POST_IMAGE_INVALID };
  }

  const inlineImages = decodeInlineImages(body.inlineImages);
  if (!inlineImages.ok) {
    return { error: true, message: inlineImages.message };
  }

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
          headerImage,
          inlineImages: inlineImages.images,
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
