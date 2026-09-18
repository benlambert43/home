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
  createPostBodySchema,
  createPostFormSchema,
  CreatePostRequestBody,
  CreatePostResponse,
} from "@home/shared";
import { redirect } from "next/navigation";

const CREATE_POST_FIELDS = {
  title: "title",
  content: "content",
} as const satisfies FieldNames<typeof createPostFormSchema>;

const UPLOAD_ID_FIELD = "uploadId";

const submittedUploadId = (formData: FormData) => {
  const uploadId = formData.get(UPLOAD_ID_FIELD);

  return typeof uploadId === "string" && uploadId.length > 0
    ? uploadId
    : undefined;
};

export const createPost = async (
  state: CreatePostFormState,
  formData: FormData,
): Promise<CreatePostFormState> => {
  const values = readFormValues(formData, CREATE_POST_FIELDS);
  const validatedFields = createPostBodySchema.safeParse({
    ...values,
    uploadId: submittedUploadId(formData),
  });

  if (!validatedFields.success) {
    const { errors, properties } = treeifyFormError(validatedFields.error);
    const { uploadId, ...fields } = properties ?? {};

    return {
      values,
      errors: [...errors, ...(uploadId?.errors ?? [])],
      properties: fields,
    };
  }

  try {
    await apiFetch<CreatePostResponse, CreatePostRequestBody>(POSTS_URL, {
      method: "POST",
      authorization: await getApiSessionToken(),
      body: validatedFields.data,
    });
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  redirect("/blog");
};
