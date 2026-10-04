import "server-only";
import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import {
  ApiError,
  apiFetch,
  errorMessage,
  NOT_FOUND_STATUS,
} from "@/app/lib/api";
import { BASE_API_URL } from "@/app/lib/serverEnv";
import {
  GetPostForEditResponse,
  GetPostResponse,
  GetPostsResponse,
  postIdParamsSchema,
} from "@home/shared";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";

export const POSTS_URL = `${BASE_API_URL}/posts`;

export const POSTS_TAG = "posts";

export const postTag = (id: string) => `post:${id}`;

export const postAuthorTag = (userId: string) => `post-author:${userId}`;

export type PostLookup = GetPostResponse | { error: false; post: null };

const requirePostId = (id: string) => {
  const params = postIdParamsSchema.safeParse({ id });
  if (!params.success) notFound();

  return params.data.id;
};

const postUrl = (id: string) => `${POSTS_URL}/${id}`;

export const getPosts = async (
  page: number,
  pageSize?: number,
): Promise<GetPostsResponse> => {
  const query = new URLSearchParams({ page: String(page) });
  if (pageSize !== undefined) query.set("pageSize", String(pageSize));

  try {
    return await apiFetch<GetPostsResponse>(`${POSTS_URL}?${query}`);
  } catch (error) {
    return { error: true, message: errorMessage(error) };
  }
};

export const getCachedPosts = async (
  page: number,
  pageSize?: number,
): Promise<GetPostsResponse> => {
  "use cache";
  cacheTag(POSTS_TAG);

  const result = await getPosts(page, pageSize);

  if (result.error) {
    cacheLife("seconds");
    return result;
  }

  cacheLife("days");
  cacheTag(
    ...new Set(result.posts.map((post) => postAuthorTag(post.authorUserId))),
  );

  return result;
};

export const getCachedPost = async (id: string): Promise<PostLookup> => {
  "use cache";
  cacheTag(postTag(id));

  try {
    const result = await apiFetch<GetPostResponse>(postUrl(id));

    cacheLife("days");
    cacheTag(postAuthorTag(result.post.authorUserId));

    return result;
  } catch (error) {
    cacheLife("seconds");

    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      return { error: false, post: null };
    }

    return { error: true, message: errorMessage(error) };
  }
};

export const getPost = async (id: string): Promise<GetPostResponse> => {
  const result = await getCachedPost(requirePostId(id));

  if (result.error) return result;
  if (result.post === null) notFound();

  return result;
};

export const getPostForEdit = async (
  id: string,
): Promise<GetPostForEditResponse> => {
  const url = `${postUrl(requirePostId(id))}/edit`;

  try {
    return await apiFetch<GetPostForEditResponse>(url, {
      authorization: await getApiSessionToken(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      notFound();
    }

    return { error: true, message: errorMessage(error) };
  }
};
