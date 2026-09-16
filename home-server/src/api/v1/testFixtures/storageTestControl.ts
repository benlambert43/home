// Unit test helpers

import type { PostThumbnailsJob } from "../post/postThumbnails";

const queuedThumbnails: Promise<void>[] = [];

interface ThumbnailQueue {
  queuePostThumbnails: (job: PostThumbnailsJob) => Promise<void>;
}

export const trackedThumbnailQueue = <Queue extends ThumbnailQueue>(
  queue: Queue,
): Queue => ({
  ...queue,
  queuePostThumbnails: (job: PostThumbnailsJob) => {
    const done = queue.queuePostThumbnails(job);
    queuedThumbnails.push(done);
    return done;
  },
});

export const queuedThumbnailsSettled = async () => {
  while (queuedThumbnails.length > 0) {
    await Promise.all(queuedThumbnails.splice(0));
  }
};
