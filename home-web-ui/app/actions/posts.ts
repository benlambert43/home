"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { apiFetch, apiRequest, errorMessage } from "@/app/lib/api";
import {
  CreatePostFormState,
  FieldNames,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import {
  createPostFormSchema,
  CreatePostRequestBody,
  CreatePostResponse,
  GetPostResponse,
  GetPostsResponse,
} from "@home/shared";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

const POSTS_URL = `${process.env.BASE_API_URL}/posts`;

const POST_LIST_TAG = "post-list";

const POST_LIST_REVALIDATE_SECONDS = 60;

const CACHED_POST_LIST = {
  next: { revalidate: POST_LIST_REVALIDATE_SECONDS, tags: [POST_LIST_TAG] },
};

const CREATE_POST_FIELDS = {
  title: "title",
  content: "content",
} as const satisfies FieldNames<typeof createPostFormSchema>;

export const createPost = async (
  state: CreatePostFormState,
  formData: FormData,
): Promise<CreatePostFormState> => {
  const values = readFormValues(formData, CREATE_POST_FIELDS);
  const validatedFields = createPostFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return { values, ...treeifyFormError(validatedFields.error) };
  }

  try {
    await apiFetch<CreatePostResponse, CreatePostRequestBody>(POSTS_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
      body: { ...validatedFields.data, inlineImages: [] },
    });
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  updateTag(POST_LIST_TAG);
  redirect("/blog");
};

export const getPosts = async (page: number): Promise<GetPostsResponse> => {
  try {
    return await apiFetch<GetPostsResponse>(
      `${POSTS_URL}?page=${page}`,
      CACHED_POST_LIST,
    );
  } catch (error) {
    return { error: true, message: errorMessage(error) };
  }
};

export const getPost = async (id: string): Promise<GetPostResponse> =>
  apiRequest<GetPostResponse>(`${POSTS_URL}/${encodeURIComponent(id)}`);
