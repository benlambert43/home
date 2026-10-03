"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { blogHref, postHref } from "@/app/blog/links";
import {
  POST_FORM_FIELDS,
  REMOVE_HEADER_IMAGE_FIELD,
  REMOVE_INLINE_IMAGES_FIELD,
  REVISION_FIELD,
  UPLOAD_ID_FIELD,
} from "@/app/blog/postForm/postFormFields";
import { apiFetch, errorMessage } from "@/app/lib/api";
import {
  CreatePostFormState,
  DeletePostState,
  readFormValues,
  treeifyFormError,
  UpdatePostFormState,
} from "@/app/lib/forms";
import { INVALID_REQUEST_MESSAGE } from "@/app/lib/messages";
import { POSTS_TAG, POSTS_URL, postTag } from "@/app/lib/posts";
import {
  createPostBodySchema,
  CreatePostRequestBody,
  CreatePostResponse,
  DeletePostResponse,
  updatePostBodySchema,
  UpdatePostRequestBody,
  UpdatePostResponse,
} from "@home/shared";
import { revalidatePath, updateTag } from "next/cache";
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

  updateTag(POSTS_TAG);
  revalidatePath("/blog");
  redirect("/blog");
};

export const updatePost = async (
  id: string,
  page: number,
  state: UpdatePostFormState,
  formData: FormData,
): Promise<UpdatePostFormState> => {
  const values = readFormValues(formData, POST_FORM_FIELDS);
  const validatedFields = updatePostBodySchema.safeParse({
    ...values,
    revision: formData.get(REVISION_FIELD),
    headerImage: formData.has(REMOVE_HEADER_IMAGE_FIELD) ? null : undefined,
    uploadId: submittedUploadId(formData),
    removeInlineImages: formData.getAll(REMOVE_INLINE_IMAGES_FIELD),
  });

  if (!validatedFields.success) {
    const { errors, properties } = treeifyFormError(validatedFields.error);
    const { title, content, ...submitted } = properties ?? {};
    const invalidRequest = Object.keys(submitted).length > 0;

    return {
      values,
      errors: invalidRequest ? [...errors, INVALID_REQUEST_MESSAGE] : errors,
      properties: { title, content },
    };
  }

  try {
    await apiFetch<UpdatePostResponse, UpdatePostRequestBody>(
      `${POSTS_URL}/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        authorization: await getApiSessionToken(),
        body: validatedFields.data,
      },
    );
  } catch (error) {
    return { values, errors: [errorMessage(error)] };
  }

  updateTag(POSTS_TAG);
  updateTag(postTag(id));
  revalidatePath(postHref(id));
  revalidatePath("/blog");
  redirect(postHref(id, page));
};

export const deletePost = async (
  id: string,
  page: number,
): Promise<DeletePostState | undefined> => {
  try {
    await apiFetch<DeletePostResponse>(
      `${POSTS_URL}/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        authorization: await getApiSessionToken(),
      },
    );
  } catch (error) {
    return { errors: [errorMessage(error)] };
  }

  updateTag(POSTS_TAG);
  updateTag(postTag(id));
  revalidatePath("/blog");
  redirect(blogHref(page));
};
