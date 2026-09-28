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
import { notFound } from "next/navigation";

export const POSTS_URL = `${BASE_API_URL}/posts`;

const postUrl = (id: string) => {
  const params = postIdParamsSchema.safeParse({ id });
  if (!params.success) notFound();

  return `${POSTS_URL}/${params.data.id}`;
};

export const getPosts = async (page: number): Promise<GetPostsResponse> => {
  const query = new URLSearchParams({ page: String(page) });

  try {
    return await apiFetch<GetPostsResponse>(`${POSTS_URL}?${query}`);
  } catch (error) {
    return { error: true, message: errorMessage(error) };
  }
};

export const getPost = async (id: string): Promise<GetPostResponse> => {
  const url = postUrl(id);

  try {
    return await apiFetch<GetPostResponse>(url);
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      notFound();
    }

    return { error: true, message: errorMessage(error) };
  }
};

export const getPostForEdit = async (
  id: string,
): Promise<GetPostForEditResponse> => {
  const url = `${postUrl(id)}/edit`;

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
