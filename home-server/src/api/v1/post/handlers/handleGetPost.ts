import { Post } from "@home/shared";
import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import { toPostResponse } from "../postResponse";

export const handleGetPost = async (
  postId: string,
): Promise<Post | undefined> => {
  const post = await PostModel.findById(postId, CURRENT_REVISION_ONLY);

  return post ? toPostResponse(post) : undefined;
};
