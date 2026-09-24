"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import {
  POST_FORM_FIELDS,
  UPLOAD_ID_FIELD,
} from "@/app/blog/postForm/postFormFields";
import { apiFetch, errorMessage } from "@/app/lib/api";
import {
  CreatePostFormState,
  readFormValues,
  treeifyFormError,
} from "@/app/lib/forms";
import { POSTS_URL } from "@/app/lib/posts";
import {
  createPostBodySchema,
  CreatePostRequestBody,
  CreatePostResponse,
} from "@home/shared";
import { redirect } from "next/navigation";

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
  const values = readFormValues(formData, POST_FORM_FIELDS);
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
