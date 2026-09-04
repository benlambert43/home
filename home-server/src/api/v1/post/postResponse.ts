import { Post } from "@home/shared";
import { ApiError } from "../http/apiError";
import { ApiMessage } from "../http/messages";
import { readPostContent } from "../storage/postStorage";
import { latestRevision, PostDocument } from "../types/db";
import { serializePost } from "../types/serialize";
import { findAuthorUsername } from "./postAuthors";

export const toPostResponse = async (post: PostDocument): Promise<Post> => {
  const revision = latestRevision(post.revisions);

  if (!revision) {
    throw new ApiError(
      ApiMessage.POST_HAS_NO_REVISION,
      500,
      `Post ${post._id.toString()} has no revision.`,
    );
  }

  return serializePost(
    post,
    await findAuthorUsername(post.authorUserId),
    await readPostContent(revision),
  );
};
