import { Types } from "mongoose";
import { ApiFailure } from "@home/shared";
import { writePostThumbnails } from "../fileOperations/postStorage";
import { CURRENT_AND_PREVIOUS_REVISIONS, PostModel } from "../model/postModel";
import {
  latestRevision,
  revisionImages,
  StoredPostRevision,
} from "../types/db";

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

const resumeThumbnailsOf = async (id: Types.ObjectId) => {
  const post = await PostModel.findById(id, CURRENT_AND_PREVIOUS_REVISIONS);
  const revision = post && latestRevision(post.revisions);
  if (!post || !revision) return;

  await queuePostThumbnails({
    post: post.fingerprint,
    revision,
    previous: latestRevision(post.revisions.slice(0, -1)),
  });
};

export const resumePostThumbnails = async () => {
  try {
    const posts = await PostModel.find({}, { _id: 1 })
      .sort({ createdDate: -1 })
      .lean();

    for (const { _id } of posts) await resumeThumbnailsOf(_id);
  } catch (e) {
    console.error("Failed to resume post thumbnails:", e);
  }
};
