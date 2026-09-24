import { postUploadImageHref } from "@/app/blog/links";
import { PendingPostImage } from "@/app/blog/postForm/pendingPostImages";
import { SERVICE_UNAVAILABLE_MESSAGE } from "@/app/lib/messages";
import { POST_IMAGE_FIELD, UploadPostImageResponse } from "@home/shared";

const CONCURRENT_UPLOADS = 3;

const UPLOAD_NOT_FOUND_STATUS = 404;

const UNREACHABLE_MESSAGE =
  "That image could not be sent. Please check your connection and try again.";

export type UploadProgress = (name: string, progress: number) => void;

export type PostImageUpload = {
  status: number;
  response: UploadPostImageResponse;
};

export type PostImageUploads = Record<string, PostImageUpload>;

export const uploadSessionLost = (uploads: PostImageUploads) =>
  Object.values(uploads).some(
    ({ status }) => status === UPLOAD_NOT_FOUND_STATUS,
  );

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
    return failure(SERVICE_UNAVAILABLE_MESSAGE);
  }

  return isUploadResponse(payload)
    ? payload
    : failure(SERVICE_UNAVAILABLE_MESSAGE);
};

export const uploadPostImage = (
  uploadId: string,
  image: PendingPostImage,
  onProgress: (progress: number) => void,
): Promise<PostImageUpload> =>
  new Promise((resolve) => {
    const request = new XMLHttpRequest();
    const body = new FormData();

    const unreachable = () => {
      resolve({
        status: request.status,
        response: failure(UNREACHABLE_MESSAGE),
      });
    };

    body.append(POST_IMAGE_FIELD, image.file, image.name);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });

    request.addEventListener("load", () => {
      resolve({
        status: request.status,
        response: uploadResponse(request.responseText),
      });
    });

    request.addEventListener("error", unreachable);

    request.addEventListener("abort", unreachable);

    request.open("PUT", postUploadImageHref(uploadId, image.name));
    request.send(body);
  });

export const uploadPostImages = async (
  uploadId: string,
  images: PendingPostImage[],
  onProgress: UploadProgress,
): Promise<PostImageUploads> => {
  const uploads: PostImageUploads = {};
  const queue = [...images];

  const uploadNext = async (): Promise<void> => {
    const image = queue.shift();
    if (image === undefined) return;

    uploads[image.name] = await uploadPostImage(uploadId, image, (progress) => {
      onProgress(image.name, progress);
    });

    return uploadNext();
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENT_UPLOADS, images.length) }, () =>
      uploadNext(),
    ),
  );

  return uploads;
};
