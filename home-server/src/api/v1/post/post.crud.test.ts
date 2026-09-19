import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST_CONTENT_NAME } from "@home/shared";
import { ApiMessage } from "../http/messages";
import {
  afterEachPostTest,
  apiCall,
  beforeEachPostTest,
  CONTENT,
  createPost,
  currentRevision,
  expectFailure,
  headerImageFile,
  MARKDOWN_CONTENT_TYPE,
  MISSING_POST_ID,
  postPath,
  postResponse,
  postSummaryResponse,
  postWithoutHeaderImage,
  publishPost,
  savedPosts,
  storedFile,
  storedText,
  stubPostDelete,
  stubPostList,
  stubPostLookup,
  TITLE,
} from "../testFixtures/postTestFixtures";

vi.mock("./postThumbnails", async (importOriginal) => {
  const { trackedThumbnailQueue } =
    await import("../testFixtures/storageTestControl");

  return trackedThumbnailQueue(
    await importOriginal<typeof import("./postThumbnails")>(),
  );
});

type SavedPost = (typeof savedPosts)[number];

const NEW_CONTENT = "# Take two\n\nThe post, rewritten.\n";

const PUBLISHED_AT = new Date("2026-01-01T00:00:00.000Z");

const EDITED_AT = new Date("2026-01-02T00:00:00.000Z");

const publishedBody = (post: SavedPost) => ({
  error: false,
  message: ApiMessage.POST_CREATED,
  post: postResponse(post, { headerImage: null }),
});

const expectRejected = (
  response: Awaited<ReturnType<typeof createPost>>,
  status: number,
  message: string,
) => {
  expectFailure(response, status, message);
  expect(savedPosts).toHaveLength(0);
};

const editPost = (post: SavedPost, body: object) =>
  apiCall("patch", postPath(post), { body });

describe("the blog post api", () => {
  beforeEach(beforeEachPostTest);

  afterEach(afterEachPostTest);

  describe("POST /api/v1/posts", () => {
    it("stores the title and the markdown content", async () => {
      const response = await createPost(postWithoutHeaderImage());

      const post = savedPosts[0];
      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(publishedBody(post));
      expect(post.title).toBe(TITLE);
      expect(post.createdDate).toEqual(post.modifiedDate);
      expect(revision.content.name).toBe(`${POST_CONTENT_NAME}.md`);
      expect(revision.content.contentType).toBe(MARKDOWN_CONTENT_TYPE);
      expect(revision.headerImage).toBeUndefined();
      expect(revision.inlineImages).toEqual([]);

      await expect(storedText(revision.content.file)).resolves.toBe(CONTENT);
    });

    it("is refused for no authorization header", async () => {
      expectRejected(
        await createPost(postWithoutHeaderImage(), null),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });
  });

  describe("GET /api/v1/posts", () => {
    it("returns a page of post summaries", async () => {
      const post = await publishPost();
      stubPostList([post]);

      const response = await apiCall("get", "?page=1&pageSize=10");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        posts: [postSummaryResponse(post)],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPosts: 1,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("is rejected for a page that is not a page number", async () => {
      expectFailure(
        await apiCall("get", "?page=0"),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });
  });

  describe("GET /api/v1/posts/:id", () => {
    it("returns the post with its title and content", async () => {
      const post = await publishPost(postWithoutHeaderImage());

      const response = await apiCall("get", postPath(post));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        post: postResponse(post, { headerImage: null }),
      });
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("get", `/${MISSING_POST_ID}`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });
  });

  describe("PATCH /api/v1/posts/:id", () => {
    it("publishes a new revision with the updated title and content", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      vi.setSystemTime(PUBLISHED_AT);
      const post = await publishPost(postWithoutHeaderImage());
      const previous = currentRevision(post);
      vi.setSystemTime(EDITED_AT);

      const response = await editPost(post, {
        title: "Take two",
        content: NEW_CONTENT,
      });

      const revision = currentRevision(post);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_UPDATED,
        post: postResponse(post, {
          title: "Take two",
          content: NEW_CONTENT,
          headerImage: null,
        }),
      });
      expect(post.revisions).toHaveLength(2);
      expect(revision.fingerprint).not.toBe(previous.fingerprint);
      expect(post.createdDate).toEqual(PUBLISHED_AT);
      expect(post.modifiedDate).toEqual(EDITED_AT);
      expect(revision.createdDate).toEqual(EDITED_AT);

      await expect(storedText(revision.content.file)).resolves.toBe(
        NEW_CONTENT,
      );
      await expect(storedText(previous.content.file)).resolves.toBe(CONTENT);
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("patch", `/${MISSING_POST_ID}`, {
          body: { title: "Take two", content: NEW_CONTENT },
        }),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });
  });

  describe("DELETE /api/v1/posts/:id", () => {
    it("deletes the post and the files of every revision", async () => {
      const post = await publishPost();
      await editPost(post, { title: "Take two", content: NEW_CONTENT });
      const files = post.revisions.flatMap((revision) => [
        revision.content.file,
        headerImageFile(revision),
      ]);
      stubPostDelete(post);

      const response = await apiCall("delete", postPath(post));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        error: false,
        message: ApiMessage.POST_DELETED,
      });
      expect(files).toHaveLength(4);

      for (const file of files) {
        await expect(storedFile(file)).rejects.toThrow();
      }
    });

    it("is not found when the post does not exist", async () => {
      stubPostDelete(null);

      expectFailure(
        await apiCall("delete", `/${MISSING_POST_ID}`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });
  });
});
