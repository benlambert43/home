import "server-only";
import {
  BAD_GATEWAY_STATUS,
  NOT_FOUND_STATUS,
  streamApiResponse,
} from "@/app/lib/api";
import { SERVICE_UNAVAILABLE_MESSAGE } from "@/app/lib/messages";
import { BASE_API_URL } from "@/app/lib/serverEnv";
import { postImageParamsSchema, postImagePath } from "@home/shared";

const RETURNED_HEADERS = [
  "cache-control",
  "content-disposition",
  "content-length",
  "content-type",
  "x-content-type-options",
];

export const proxyPostImage = async (params: unknown) => {
  const parsed = postImageParamsSchema.safeParse(params);
  if (!parsed.success) return new Response(null, { status: NOT_FOUND_STATUS });

  const { id, name } = parsed.data;
  const url = `${BASE_API_URL}/${postImagePath(id, name)}`;

  let response: Response;

  try {
    response = await fetch(url);
  } catch (e) {
    console.error(`GET ${url} could not reach the API:`, e);
    return new Response(SERVICE_UNAVAILABLE_MESSAGE, {
      status: BAD_GATEWAY_STATUS,
    });
  }

  return streamApiResponse(response, RETURNED_HEADERS);
};
