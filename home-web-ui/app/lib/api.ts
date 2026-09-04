import "server-only";
import { ApiFailure, ApiResponse, SuccessOf } from "@home/shared";

type ApiRequest<Body> = {
  method?: "GET" | "POST";
  authorization?: string;
  body?: Body;
  cache?: RequestCache;
};

export const SERVICE_UNAVAILABLE_MESSAGE =
  "There was an error on our end, please try again in a few moments.";

export const apiRequest = async <Result extends ApiResponse, Body = undefined>(
  url: string,
  { method = "GET", authorization, body, cache }: ApiRequest<Body> = {},
): Promise<Result> => {
  let response: Response;

  try {
    response = await fetch(url, {
      method,
      cache,
      headers: {
        "Content-Type": "application/json",
        ...(authorization === undefined
          ? {}
          : { Authorization: authorization }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    console.error(`${method} ${url} could not reach the API:`, e);
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE);
  }

  const payload = (await response.json().catch(() => null)) as Result | null;

  if (!payload) {
    console.error(
      `${method} ${url} returned a non-JSON response with status ${response.status}.`,
    );
    throw new Error(SERVICE_UNAVAILABLE_MESSAGE);
  }

  return payload;
};

export const apiFetch = async <Result extends ApiResponse, Body = undefined>(
  url: string,
  request: ApiRequest<Body> = {},
): Promise<SuccessOf<Result>> => {
  const payload = (await apiRequest<Result, Body>(url, request)) as
    SuccessOf<Result> | ApiFailure;

  if (payload.error) {
    throw new Error(payload.message ?? "Unknown error.");
  }

  return payload;
};

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error.";
