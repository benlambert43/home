"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { apiFetch, errorMessage } from "@/app/lib/api";
import {
  CreatePostFormState,
  FieldNames,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import { POSTS_URL } from "@/app/lib/posts";
import {
  createPostFormSchema,
  CreatePostRequestBody,
  CreatePostResponse,
} from "@home/shared";
import { redirect } from "next/navigation";

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

  redirect("/blog");
};
