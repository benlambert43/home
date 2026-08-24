import "server-only";
import { ApiFailure, ApiResponse, SuccessOf } from "@home/shared";

type ApiRequest<Body> = {
  method?: "GET" | "POST";
  authorization?: string;
  body?: Body;
};

export const apiFetch = async <Result extends ApiResponse, Body = undefined>(
  url: string,
  { method = "GET", authorization, body }: ApiRequest<Body> = {},
): Promise<SuccessOf<Result>> => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authorization === undefined ? {} : { Authorization: authorization }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload: SuccessOf<Result> | ApiFailure | null = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? `response.status ${response.status}`);
  }

  if (!payload || payload.error) {
    throw new Error(payload?.message ?? "Unknown error.");
  }

  return payload;
};

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error.";
