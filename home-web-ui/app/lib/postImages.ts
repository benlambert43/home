import "server-only";
import { NOT_FOUND_STATUS, SERVICE_UNAVAILABLE_MESSAGE } from "@/app/lib/api";
import { POSTS_URL } from "@/app/lib/posts";
import { postIdParamsSchema, postInlineImageParamsSchema } from "@home/shared";

const BAD_GATEWAY_STATUS = 502;

const REVALIDATE_CACHE_CONTROL = "max-age=0";

const FORWARDED_REQUEST_HEADERS = [
  "cache-control",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "range",
];

const RETURNED_RESPONSE_HEADERS = [
  "accept-ranges",
  "cache-control",
  "content-disposition",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
  "x-content-type-options",
];

const pickHeaders = (source: Headers, names: string[]) => {
  const picked = new Headers();

  names.forEach((name) => {
    const value = source.get(name);
    if (value !== null) picked.set(name, value);
  });

  return picked;
};

const forwardedHeaders = (request: Request) => {
  const headers = pickHeaders(request.headers, FORWARDED_REQUEST_HEADERS);

  if (!headers.has("cache-control")) {
    headers.set("cache-control", REVALIDATE_CACHE_CONTROL);
  }

  return headers;
};

const proxyImage = async (request: Request, url: string) => {
  let response: Response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: forwardedHeaders(request),
    });
  } catch (e) {
    console.error(`GET ${url} could not reach the API:`, e);
    return new Response(SERVICE_UNAVAILABLE_MESSAGE, {
      status: BAD_GATEWAY_STATUS,
    });
  }

  return new Response(response.body, {
    status: response.status,
    headers: pickHeaders(response.headers, RETURNED_RESPONSE_HEADERS),
  });
};

const notFoundResponse = () => new Response(null, { status: NOT_FOUND_STATUS });

export const proxyFullSizeHeaderImage = async (
  request: Request,
  params: unknown,
) => {
  const parsed = postIdParamsSchema.safeParse(params);
  if (!parsed.success) return notFoundResponse();

  return proxyImage(
    request,
    `${POSTS_URL}/${parsed.data.id}/headerImage/fullSize`,
  );
};

export const proxyFullSizeInlineImage = async (
  request: Request,
  params: unknown,
) => {
  const parsed = postInlineImageParamsSchema.safeParse(params);
  if (!parsed.success) return notFoundResponse();

  const { id, name } = parsed.data;

  return proxyImage(request, `${POSTS_URL}/${id}/images/${name}/fullSize`);
};
