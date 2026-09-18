"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import {
  apiRequest,
  errorMessage,
  FORBIDDEN_MESSAGE,
  INVALID_REQUEST_MESSAGE,
} from "@/app/lib/api";
import { BASE_API_URL } from "@/app/lib/serverEnv";
import {
  ApiFailure,
  createPostUploadBodySchema,
  CreatePostUploadRequestBody,
  CreatePostUploadResponse,
  DeletePostUploadResponse,
  postUploadParamsSchema,
  postUploadPath,
  postUploadsPath,
} from "@home/shared";

const failure = (message: string): ApiFailure => ({ error: true, message });

const isAdmin = async () => (await getBffSessionUser())?.role === "admin";

export const startPostUpload = async (
  manifest: CreatePostUploadRequestBody,
): Promise<CreatePostUploadResponse> => {
  const validatedManifest = createPostUploadBodySchema.safeParse(manifest);
  if (!validatedManifest.success) return failure(INVALID_REQUEST_MESSAGE);

  if (!(await isAdmin())) return failure(FORBIDDEN_MESSAGE);

  try {
    return await apiRequest<
      CreatePostUploadResponse,
      CreatePostUploadRequestBody
    >(`${BASE_API_URL}/${postUploadsPath}`, {
      method: "POST",
      authorization: await getApiSessionToken(),
      body: validatedManifest.data,
    });
  } catch (error) {
    return failure(errorMessage(error));
  }
};

export const discardPostUpload = async (
  uploadId: string,
): Promise<DeletePostUploadResponse> => {
  const validatedParams = postUploadParamsSchema.safeParse({ uploadId });
  if (!validatedParams.success) return failure(INVALID_REQUEST_MESSAGE);

  if (!(await isAdmin())) return failure(FORBIDDEN_MESSAGE);

  try {
    return await apiRequest<DeletePostUploadResponse>(
      `${BASE_API_URL}/${postUploadPath(validatedParams.data.uploadId)}`,
      { method: "DELETE", authorization: await getApiSessionToken() },
    );
  } catch (error) {
    return failure(errorMessage(error));
  }
};
