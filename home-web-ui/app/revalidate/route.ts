import { failureResponse, FORBIDDEN_STATUS } from "@/app/lib/api";
import {
  FORBIDDEN_MESSAGE,
  SERVICE_UNAVAILABLE_MESSAGE,
} from "@/app/lib/messages";
import { getCachedPosts, revalidateBlogPaths } from "@/app/lib/posts";
import { REVALIDATE_SECRET } from "@/app/lib/serverEnv";
import { ApiSuccess } from "@home/shared";
import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

const REVALIDATE_SECRET_HEADER = "x-revalidate-secret";

const SERVICE_UNAVAILABLE_STATUS = 503;

const REVALIDATED_MESSAGE = "Revalidated /, /blog and /blog/page/[page].";

const secretMatches = (provided: string | null) => {
  if (provided === null) return false;

  const expected = Buffer.from(REVALIDATE_SECRET);
  const received = Buffer.from(provided);

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
};

export const POST = async (request: Request) => {
  if (!secretMatches(request.headers.get(REVALIDATE_SECRET_HEADER))) {
    return failureResponse(FORBIDDEN_STATUS, FORBIDDEN_MESSAGE);
  }

  const result = await getCachedPosts(1);
  if (result.error) {
    return failureResponse(
      SERVICE_UNAVAILABLE_STATUS,
      SERVICE_UNAVAILABLE_MESSAGE,
    );
  }

  revalidatePath("/");
  revalidateBlogPaths();

  return Response.json({
    error: false,
    message: REVALIDATED_MESSAGE,
  } satisfies ApiSuccess);
};
