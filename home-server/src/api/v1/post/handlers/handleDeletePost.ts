import { PostModel } from "../../model/postModel";
import { deletePostStorage } from "../../fileOperations/postStorage";
import { retirePostSlug } from "../postSlugs";

export const handleDeletePost = async (postId: string): Promise<boolean> => {
  const found = await PostModel.findById(postId, "slug");
  if (!found) return false;

  await retirePostSlug(found.slug);

  const post = await PostModel.findByIdAndDelete(postId);
  if (!post) return false;

  await deletePostStorage(post.fingerprint).catch((e: unknown) => {
    console.error(
      `Failed to clean up storage for post ${post.fingerprint}:`,
      e,
    );
  });

  return true;
};
