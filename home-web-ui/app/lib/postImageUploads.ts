import "server-only";
import { getApiSessionToken } from "@/app/auth/getApiSessionToken";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { BAD_GATEWAY_STATUS, streamApiResponse } from "@/app/lib/api";
import {
  FORBIDDEN_MESSAGE,
  INVALID_REQUEST_MESSAGE,
  SERVICE_UNAVAILABLE_MESSAGE,
} from "@/app/lib/messages";
import { BASE_API_URL, BASE_SITE_URL } from "@/app/lib/serverEnv";
import {
  ApiFailure,
  MAX_POST_IMAGE_BYTES,
  MAX_POST_IMAGE_MEGABYTES,
  postUploadImageParamsSchema,
  postUploadImagePath,
} from "@home/shared";

const BAD_REQUEST_STATUS = 400;

const FORBIDDEN_STATUS = 403;

const CONTENT_TOO_LARGE_STATUS = 413;

const UNSUPPORTED_MEDIA_TYPE_STATUS = 415;

const TOO_LARGE_MESSAGE = `That image is larger than ${MAX_POST_IMAGE_MEGABYTES} MB. Please use a smaller image and try again.`;

const MULTIPART_CONTENT_TYPE = "multipart/form-data";

const MULTIPART_ENVELOPE_BYTES = 64 * 1024;

const MAX_UPLOAD_BODY_BYTES = MAX_POST_IMAGE_BYTES + MULTIPART_ENVELOPE_BYTES;

const SITE_ORIGIN = new URL(BASE_SITE_URL).origin;

const RETURNED_HEADERS = ["content-type"];

type StreamedRequestInit = RequestInit & { duplex: "half" };

const failureResponse = (status: number, message: string) =>
  Response.json({ error: true, message } satisfies ApiFailure, { status });

const streamedUpload = (
  request: Request,
  contentType: string,
  authorization: string,
): StreamedRequestInit => ({
  method: "PUT",
  body: request.body,
  duplex: "half",
  headers: {
    "Content-Type": contentType,
    Authorization: authorization,
  },
});

export const uploadPostImage = async (request: Request, params: unknown) => {
  const user = await getBffSessionUser();
  if (user?.role !== "admin") {
    return failureResponse(FORBIDDEN_STATUS, FORBIDDEN_MESSAGE);
  }

  if (request.headers.get("origin") !== SITE_ORIGIN) {
    return failureResponse(FORBIDDEN_STATUS, FORBIDDEN_MESSAGE);
  }

  const parsed = postUploadImageParamsSchema.safeParse(params);
  if (!parsed.success) {
    return failureResponse(BAD_REQUEST_STATUS, INVALID_REQUEST_MESSAGE);
  }

  const contentType = request.headers.get("content-type");
  if (!contentType?.toLowerCase().startsWith(MULTIPART_CONTENT_TYPE)) {
    return failureResponse(
      UNSUPPORTED_MEDIA_TYPE_STATUS,
      INVALID_REQUEST_MESSAGE,
    );
  }

  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BODY_BYTES) {
    return failureResponse(CONTENT_TOO_LARGE_STATUS, TOO_LARGE_MESSAGE);
  }

  const { uploadId, name } = parsed.data;
  const url = `${BASE_API_URL}/${postUploadImagePath(uploadId, name)}`;

  let response: Response;

  try {
    response = await fetch(
      url,
      streamedUpload(request, contentType, await getApiSessionToken()),
    );
  } catch (e) {
    console.error(`PUT ${url} could not reach the API:`, e);
    return failureResponse(BAD_GATEWAY_STATUS, SERVICE_UNAVAILABLE_MESSAGE);
  }

  return streamApiResponse(response, RETURNED_HEADERS);
};
