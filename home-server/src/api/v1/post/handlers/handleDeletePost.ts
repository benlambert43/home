import { PostModel } from "../../model/postModel";
import { deletePostStorage } from "../../storage/postStorage";

export const handleDeletePost = async (postId: string): Promise<boolean> => {
  const post = await PostModel.findByIdAndDelete(postId);
  if (!post) return false;

  await deletePostStorage(post.fingerprint);

  return true;
};
