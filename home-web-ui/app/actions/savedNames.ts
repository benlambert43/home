"use server";

import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import {
  ApiError,
  apiFetch,
  errorMessage,
  UNAUTHENTICATED_STATUS,
} from "@/app/lib/api";
import { INVALID_REQUEST_MESSAGE } from "@/app/lib/messages";
import { BASE_API_URL } from "@/app/lib/serverEnv";
import {
  ApiFailure,
  ApiResponse,
  DeleteSavedNameResponse,
  GetSavedNamesResponse,
  lookupSavedNamesBodySchema,
  LookupSavedNamesRequestBody,
  LookupSavedNamesResponse,
  saveNameBodySchema,
  SaveNameRequestBody,
  SaveNameResponse,
  savedNameIdParamsSchema,
  savedNameListQuerySchema,
  SuccessOf,
} from "@home/shared";

const SAVED_NAMES_URL = `${BASE_API_URL}/savedNames`;

export type SavedNamesFailure = ApiFailure & { signedOut: boolean };

export type SavedNamesResult<Response extends ApiResponse> =
  SuccessOf<Response> | SavedNamesFailure;

const invalidRequest: SavedNamesFailure = {
  error: true,
  message: INVALID_REQUEST_MESSAGE,
  signedOut: false,
};

const failure = (error: unknown): SavedNamesFailure => ({
  error: true,
  message: errorMessage(error),
  signedOut:
    error instanceof ApiError && error.status === UNAUTHENTICATED_STATUS,
});

const savedNamesRequest = async <
  Response extends ApiResponse,
  Body = undefined,
>(
  url: string,
  method: "GET" | "POST" | "DELETE",
  body?: Body,
): Promise<SavedNamesResult<Response>> => {
  try {
    return await apiFetch<Response, Body>(url, {
      method,
      authorization: await getApiSessionToken(),
      body,
    });
  } catch (error) {
    return failure(error);
  }
};

export const getSavedNames = async (
  before?: string,
): Promise<SavedNamesResult<GetSavedNamesResponse>> => {
  const query = savedNameListQuerySchema.safeParse({ before });
  if (!query.success) return invalidRequest;

  const search = new URLSearchParams({ pageSize: String(query.data.pageSize) });
  if (query.data.before !== undefined) search.set("before", query.data.before);

  return savedNamesRequest<GetSavedNamesResponse>(
    `${SAVED_NAMES_URL}?${search}`,
    "GET",
  );
};

export const saveName = async (
  name: SaveNameRequestBody,
): Promise<SavedNamesResult<SaveNameResponse>> => {
  const body = saveNameBodySchema.safeParse(name);
  if (!body.success) return invalidRequest;

  return savedNamesRequest<SaveNameResponse, SaveNameRequestBody>(
    SAVED_NAMES_URL,
    "POST",
    body.data,
  );
};

export const lookupSavedNames = async (
  lookup: LookupSavedNamesRequestBody,
): Promise<SavedNamesResult<LookupSavedNamesResponse>> => {
  const body = lookupSavedNamesBodySchema.safeParse(lookup);
  if (!body.success) return invalidRequest;

  return savedNamesRequest<
    LookupSavedNamesResponse,
    LookupSavedNamesRequestBody
  >(`${SAVED_NAMES_URL}/lookup`, "POST", body.data);
};

export const removeSavedName = async (
  id: string,
): Promise<SavedNamesResult<DeleteSavedNameResponse>> => {
  const params = savedNameIdParamsSchema.safeParse({ id });
  if (!params.success) return invalidRequest;

  return savedNamesRequest<DeleteSavedNameResponse>(
    `${SAVED_NAMES_URL}/${params.data.id}`,
    "DELETE",
  );
};
