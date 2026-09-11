import { UpdatePostRequestBody, UpdatePostResponse } from "@home/shared";
import { ApiMessage, inlineImageNotOnPost } from "../../http/messages";
import { PostModel } from "../../model/postModel";
import {
  PostFileSource,
  writePostRevision,
} from "../../fileOperations/postStorage";
import { requireLatestRevision, StoredPostFile } from "../../types/db";
import { Decoded, decodeHeaderImage, decodeInlineImages } from "../postImages";
import { toPostResponse } from "../postResponse";

const namesInLowercase = (names: string[]) =>
  new Set(names.map((name) => name.toLowerCase()));

const resolveHeaderImage = (
  requested: string | null | undefined,
  stored: StoredPostFile | undefined,
): Decoded<PostFileSource | undefined> => {
  if (requested === null) return { ok: true, value: undefined };
  if (requested !== undefined) return decodeHeaderImage(requested);

  return { ok: true, value: stored };
};

const resolveInlineImages = (
  stored: StoredPostFile[],
  body: UpdatePostRequestBody,
): Decoded<PostFileSource[]> => {
  const added = decodeInlineImages(body.inlineImages ?? []);
  if (!added.ok) return added;

  const removed = body.removeInlineImages ?? [];
  const onPost = namesInLowercase(stored.map((image) => image.name));
  const missing = removed.find((name) => !onPost.has(name.toLowerCase()));

  if (missing) return { ok: false, message: inlineImageNotOnPost(missing) };

  const dropped = namesInLowercase([
    ...added.value.map((image) => image.name),
    ...removed,
  ]);
  const kept = stored.filter((image) => !dropped.has(image.name.toLowerCase()));

  return { ok: true, value: [...kept, ...added.value] };
};

export const handleUpdatePost = async (
  postId: string,
  body: UpdatePostRequestBody,
): Promise<UpdatePostResponse | undefined> => {
  const post = await PostModel.findById(postId);
  if (!post) return undefined;

  const previous = requireLatestRevision(post);

  const headerImage = resolveHeaderImage(
    body.headerImage,
    previous.headerImage,
  );
  if (!headerImage.ok) return { error: true, message: headerImage.message };

  const inlineImages = resolveInlineImages(previous.inlineImages, body);
  if (!inlineImages.ok) return { error: true, message: inlineImages.message };

  post.revisions.push(
    await writePostRevision(post.fingerprint, {
      content: body.content ?? previous.content,
      headerImage: headerImage.value,
      inlineImages: inlineImages.value,
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
