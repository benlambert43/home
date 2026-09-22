import { Post } from "@home/shared";
import { PostModel } from "../../model/postModel";
import { revisionImages } from "../../types/db";
import { toPostResponse } from "../postResponse";

export const handleGetPostForEdit = async (
  postId: string,
): Promise<{ post: Post; usedImageNames: string[] } | undefined> => {
  const post = await PostModel.findById(postId);
  if (!post) return undefined;

  const usedImageNames = [
    ...new Set(
      post.revisions.flatMap(revisionImages).map((image) => image.name),
    ),
  ];

  return { post: await toPostResponse(post), usedImageNames };
};
