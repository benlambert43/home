import { UpdatePostRequestBody, UpdatePostResponse } from "@home/shared";
import { ApiError } from "../../http/apiError";
import { ApiMessage } from "../../http/messages";
import { PostModel } from "../../model/postModel";
import {
  carryForward,
  readPostContent,
  writePostRevision,
} from "../../storage/postStorage";
import { latestRevision } from "../../types/db";
import { decodeHeaderImage, decodeInlineImages } from "../postImages";
import { toPostResponse } from "../postResponse";

export const handleUpdatePost = async (
  postId: string,
  body: UpdatePostRequestBody,
): Promise<UpdatePostResponse | undefined> => {
  const post = await PostModel.findById(postId);
  if (!post) return undefined;

  const previous = latestRevision(post.revisions);
  if (!previous) {
    throw new ApiError(
      ApiMessage.POST_HAS_NO_REVISION,
      500,
      `Post ${postId} has no revision.`,
    );
  }

  const headerImage =
    body.headerImage === undefined
      ? await carryForward(previous.headerImage)
      : decodeHeaderImage(body.headerImage);

  if (!headerImage) {
    return { error: true, message: ApiMessage.POST_IMAGE_INVALID };
  }

  const added = decodeInlineImages(body.inlineImages ?? []);
  if (!added.ok) return { error: true, message: added.message };

  const replaced = new Set(
    added.images.map((image) => image.name.toLowerCase()),
  );

  post.revisions.push(
    await writePostRevision(post.fingerprint, {
      content: body.content ?? (await readPostContent(previous)),
      headerImage,
      inlineImages: [
        ...(await Promise.all(
          previous.inlineImages
            .filter((image) => !replaced.has(image.name.toLowerCase()))
            .map(carryForward),
        )),
        ...added.images,
      ],
    }),
  );

  if (body.title !== undefined) post.title = body.title;

  post.modifiedDate = new Date();
  await post.save();

  return {
    error: false,
    message: ApiMessage.POST_UPDATED,
    post: await toPostResponse(post),
  };
};
