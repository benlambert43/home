import { UpdatePostRequestBody, UpdatePostResponse } from "@home/shared";
import { ApiError } from "../../http/apiError";
import { ApiMessage, inlineImageNotOnPost } from "../../http/messages";
import { PostModel } from "../../model/postModel";
import {
  carryForward,
  PostFileContent,
  readPostContent,
  writePostRevision,
} from "../../storage/postStorage";
import { latestRevision, StoredPostFile } from "../../types/db";
import { decodeHeaderImage, decodeInlineImages } from "../postImages";
import { toPostResponse } from "../postResponse";

const resolveHeaderImage = async (
  requested: string | null | undefined,
  stored: StoredPostFile | undefined,
): Promise<PostFileContent | undefined> => {
  if (requested === undefined) return stored && (await carryForward(stored));

  return requested === null ? undefined : decodeHeaderImage(requested);
};

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

  const headerImage = await resolveHeaderImage(
    body.headerImage,
    previous.headerImage,
  );

  if (typeof body.headerImage === "string" && !headerImage) {
    return { error: true, message: ApiMessage.POST_IMAGE_INVALID };
  }

  const added = decodeInlineImages(body.inlineImages ?? []);
  if (!added.ok) return { error: true, message: added.message };

  const onPost = new Set(
    previous.inlineImages.map((image) => image.name.toLowerCase()),
  );
  const removed = body.removeInlineImages ?? [];
  const missing = removed.find((name) => !onPost.has(name.toLowerCase()));

  if (missing !== undefined) {
    return { error: true, message: inlineImageNotOnPost(missing) };
  }

  const dropped = new Set(
    [...added.images.map((image) => image.name), ...removed].map((name) =>
      name.toLowerCase(),
    ),
  );

  post.revisions.push(
    await writePostRevision(post.fingerprint, {
      content: body.content ?? (await readPostContent(previous)),
      headerImage,
      inlineImages: [
        ...(await Promise.all(
          previous.inlineImages
            .filter((image) => !dropped.has(image.name.toLowerCase()))
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
