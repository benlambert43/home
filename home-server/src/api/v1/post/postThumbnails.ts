import { ApiFailure } from "@home/shared";
import { writePostThumbnails } from "../fileOperations/postStorage";
import { revisionImages, StoredPostRevision } from "../types/db";

export interface PostThumbnailsJob {
  post: string;
  revision: StoredPostRevision;
  previous?: StoredPostRevision;
}

export interface PostWrite<Response> {
  response: Response;
  thumbnails?: PostThumbnailsJob;
}

export const refusedPostWrite = (message: string): PostWrite<ApiFailure> => ({
  response: { error: true, message },
});

let thumbnailQueue = Promise.resolve();

const createPostThumbnails = async ({
  post,
  revision,
  previous,
}: PostThumbnailsJob) => {
  for (const image of revisionImages(revision)) {
    const failures = await writePostThumbnails(post, revision, image, previous);

    failures.forEach(({ size, error }) => {
      console.error(
        `Failed to create the ${size} thumbnail of ${image.name} in revision ${revision.fingerprint} of post ${post}:`,
        error,
      );
    });
  }
};

export const queuePostThumbnails = (job: PostThumbnailsJob) => {
  thumbnailQueue = thumbnailQueue
    .then(() => createPostThumbnails(job))
    .catch((e: unknown) => {
      console.error(
        `Failed to create thumbnails for revision ${job.revision.fingerprint} of post ${job.post}:`,
        e,
      );
    });

  return thumbnailQueue;
};
