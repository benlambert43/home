import { Post } from "@home/shared";
import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import { toPostResponse } from "../postResponse";

export const handleGetPost = async (
  slug: string,
): Promise<Post | undefined> => {
  const post = await PostModel.findOne({ slug }, CURRENT_REVISION_ONLY);

  return post ? toPostResponse(post) : undefined;
};
