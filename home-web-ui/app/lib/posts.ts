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
  DEFAULT_POST_PAGE_SIZE,
  GetPostForEditResponse,
  GetPostResponse,
  GetPostsResponse,
  postIdParamsSchema,
  postSlugParamsSchema,
} from "@home/shared";
import { cacheLife, cacheTag, revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

export const POSTS_URL = `${BASE_API_URL}/posts`;

export const POSTS_TAG = "posts";

export const postTag = (id: string) => `post:${id}`;

export const postSlugTag = (slug: string) => `post-slug:${slug}`;

export const postAuthorTag = (userId: string) => `post-author:${userId}`;

export const revalidatePostLists = () => {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/page/[page]", "page");
};

export type PostLookup = GetPostResponse | { error: false; post: null };

const requirePostId = (id: string) => {
  const params = postIdParamsSchema.safeParse({ id });
  if (!params.success) notFound();

  return params.data.id;
};

const requirePostSlug = (slug: string) => {
  const params = postSlugParamsSchema.safeParse({ slug });
  if (!params.success) notFound();

  return params.data.slug;
};

const postUrl = (key: string) => `${POSTS_URL}/${key}`;

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

const getCachedPostsPage = async (
  page: number,
  pageSize: number,
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

export const getCachedPosts = (
  page: number,
  pageSize = DEFAULT_POST_PAGE_SIZE,
) => getCachedPostsPage(page, pageSize);

export const getCachedPost = async (slug: string): Promise<PostLookup> => {
  "use cache";
  cacheTag(POSTS_TAG, postSlugTag(slug));

  try {
    const result = await apiFetch<GetPostResponse>(postUrl(slug));
    const { post } = result;

    if (post.headerImage && !post.shareImage) {
      cacheLife("minutes");
    } else {
      cacheLife("days");
    }

    cacheTag(postTag(post._id), postAuthorTag(post.authorUserId));

    return result;
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      cacheLife("days");
      return { error: false, post: null };
    }

    cacheLife("seconds");
    return { error: true, message: errorMessage(error) };
  }
};

export const getPost = async (slug: string): Promise<GetPostResponse> => {
  const result = await getCachedPost(requirePostSlug(slug));

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
