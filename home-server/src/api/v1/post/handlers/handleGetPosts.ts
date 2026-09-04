import { PostListQuery, PostSummary, PostPagination } from "@home/shared";
import { CURRENT_REVISION_ONLY, PostModel } from "../../model/postModel";
import { serializePostSummary } from "../../types/serialize";
import { findAuthorUsernames } from "../postAuthors";

export const handleGetPosts = async ({
  page,
  pageSize,
}: PostListQuery): Promise<{
  posts: PostSummary[];
  pagination: PostPagination;
}> => {
  const totalPosts = await PostModel.countDocuments();

  const posts = await PostModel.find({}, CURRENT_REVISION_ONLY)
    .sort({ createdDate: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  const authorUsernames = await findAuthorUsernames(
    posts.map((post) => post.authorUserId),
  );

  return {
    posts: posts.map((post) =>
      serializePostSummary(
        post,
        authorUsernames.get(post.authorUserId.toString()) ?? null,
      ),
    ),
    pagination: {
      page,
      pageSize,
      totalPosts,
      totalPages: Math.max(1, Math.ceil(totalPosts / pageSize)),
      hasMore: page * pageSize < totalPosts,
    },
  };
};
