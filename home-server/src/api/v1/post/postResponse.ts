import { Post } from "@home/shared";
import { readPostContent } from "../storage/postStorage";
import { PostDocument, requireLatestRevision } from "../types/db";
import { serializePost } from "../types/serialize";
import { findAuthorUsername } from "./postAuthors";

export const toPostResponse = async (post: PostDocument): Promise<Post> => {
  const revision = requireLatestRevision(post);

  return serializePost(
    post,
    await findAuthorUsername(post.authorUserId),
    await readPostContent(revision),
  );
};
