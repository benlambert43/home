import { AdjacentPost, Post } from "@home/shared";
import {
  CURRENT_REVISION_ONLY,
  PostModel,
  WITH_REVISIONS,
} from "../../model/postModel";
import { toPostResponse } from "../postResponse";

const ADJACENT_POST_FIELDS = { slug: 1, title: 1 };

const findAdjacentPost = async (
  createdDate: Date,
  direction: "older" | "newer",
): Promise<AdjacentPost | null> => {
  const older = direction === "older";

  const adjacent = await PostModel.findOne(
    {
      ...WITH_REVISIONS,
      createdDate: older ? { $lt: createdDate } : { $gt: createdDate },
    },
    ADJACENT_POST_FIELDS,
  )
    .sort({ createdDate: older ? -1 : 1 })
    .lean();

  return adjacent ? { slug: adjacent.slug, title: adjacent.title } : null;
};

export const handleGetPost = async (
  slug: string,
): Promise<
  | { post: Post; previous: AdjacentPost | null; next: AdjacentPost | null }
  | undefined
> => {
  const post = await PostModel.findOne({ slug }, CURRENT_REVISION_ONLY);
  if (!post) return undefined;

  return {
    post: await toPostResponse(post),
    previous: await findAdjacentPost(post.createdDate, "newer"),
    next: await findAdjacentPost(post.createdDate, "older"),
  };
};
