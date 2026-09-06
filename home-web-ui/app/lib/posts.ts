import "server-only";
import {
  ApiError,
  apiFetch,
  errorMessage,
  NOT_FOUND_STATUS,
} from "@/app/lib/api";
import { BASE_API_URL } from "@/app/lib/serverEnv";
import { GetPostResponse, GetPostsResponse } from "@home/shared";
import { notFound } from "next/navigation";

export const POSTS_URL = `${BASE_API_URL}/posts`;

export const getPosts = async (page: number): Promise<GetPostsResponse> => {
  const query = new URLSearchParams({ page: String(page) });

  try {
    return await apiFetch<GetPostsResponse>(`${POSTS_URL}?${query}`);
  } catch (error) {
    return { error: true, message: errorMessage(error) };
  }
};

export const getPost = async (id: string): Promise<GetPostResponse> => {
  try {
    return await apiFetch<GetPostResponse>(
      `${POSTS_URL}/${encodeURIComponent(id)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === NOT_FOUND_STATUS) {
      notFound();
    }

    return { error: true, message: errorMessage(error) };
  }
};
