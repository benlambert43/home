import "server-only";
import { ApiResponse, AuthenticatedUserResponse } from "@home/shared";

type ApiRequest<Body> = {
  method?: "GET" | "POST";
  authorization?: string;
  body?: Body;
};

export const apiFetch = async <Payload extends ApiResponse, Body = undefined>(
  url: string,
  { method = "GET", authorization, body }: ApiRequest<Body> = {},
): Promise<Payload> => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authorization === undefined ? {} : { Authorization: authorization }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload: Partial<Payload> | null = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? `response.status ${response.status}`);
  }

  if (!payload || payload.error !== false) {
    throw new Error(payload?.message ?? "Unknown error.");
  }

  return payload as Payload;
};

export const requireSession = ({ jwt, user }: AuthenticatedUserResponse) => {
  if (!jwt || !user) {
    throw new Error("The response did not include a session.");
  }
  return { jwt, user };
};

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error.";
