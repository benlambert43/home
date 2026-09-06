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

export const NOT_FOUND_STATUS = 404;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const requestApi = async <Result extends ApiResponse, Body>(
  url: string,
  { method = "GET", authorization, body, cache }: ApiRequest<Body>,
): Promise<{ payload: Result; status: number }> => {
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

  return { payload, status: response.status };
};

export const apiRequest = async <Result extends ApiResponse, Body = undefined>(
  url: string,
  request: ApiRequest<Body> = {},
): Promise<Result> => (await requestApi<Result, Body>(url, request)).payload;

export const apiFetch = async <Result extends ApiResponse, Body = undefined>(
  url: string,
  request: ApiRequest<Body> = {},
): Promise<SuccessOf<Result>> => {
  const { payload, status } = await requestApi<Result, Body>(url, request);
  const result = payload as SuccessOf<Result> | ApiFailure;

  if (result.error) {
    throw new ApiError(result.message, status);
  }

  return result;
};

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error.";
