import { postUploadImageHref } from "@/app/blog/links";
import { PendingPostImage } from "@/app/blog/newPost/pendingPostImages";
import { POST_IMAGE_FIELD, UploadPostImageResponse } from "@home/shared";

const CONCURRENT_UPLOADS = 3;

const UNREACHABLE_MESSAGE =
  "That image could not be sent. Please check your connection and try again.";

const UNREADABLE_RESPONSE_MESSAGE =
  "There was an error on our end, please try again in a few moments.";

export type UploadProgress = (name: string, progress: number) => void;

export type PostImageUploadResponses = Record<string, UploadPostImageResponse>;

const failure = (message: string): UploadPostImageResponse => ({
  error: true,
  message,
});

const isUploadResponse = (
  payload: unknown,
): payload is UploadPostImageResponse =>
  typeof payload === "object" && payload !== null && "error" in payload;

const uploadResponse = (body: string): UploadPostImageResponse => {
  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    return failure(UNREADABLE_RESPONSE_MESSAGE);
  }

  return isUploadResponse(payload)
    ? payload
    : failure(UNREADABLE_RESPONSE_MESSAGE);
};

export const uploadPostImage = (
  uploadId: string,
  image: PendingPostImage,
  onProgress: (progress: number) => void,
): Promise<UploadPostImageResponse> =>
  new Promise((resolve) => {
    const request = new XMLHttpRequest();
    const body = new FormData();

    body.append(POST_IMAGE_FIELD, image.file, image.name);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });

    request.addEventListener("load", () => {
      resolve(uploadResponse(request.responseText));
    });

    request.addEventListener("error", () => {
      resolve(failure(UNREACHABLE_MESSAGE));
    });

    request.addEventListener("abort", () => {
      resolve(failure(UNREACHABLE_MESSAGE));
    });

    request.open("PUT", postUploadImageHref(uploadId, image.name));
    request.send(body);
  });

export const uploadPostImages = async (
  uploadId: string,
  images: PendingPostImage[],
  onProgress: UploadProgress,
): Promise<PostImageUploadResponses> => {
  const responses: PostImageUploadResponses = {};
  const queue = [...images];

  const uploadNext = async (): Promise<void> => {
    const image = queue.shift();
    if (image === undefined) return;

    responses[image.name] = await uploadPostImage(
      uploadId,
      image,
      (progress) => {
        onProgress(image.name, progress);
      },
    );

    return uploadNext();
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENT_UPLOADS, images.length) }, () =>
      uploadNext(),
    ),
  );

  return responses;
};
