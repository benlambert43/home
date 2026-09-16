import { Error as MongooseError } from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_POST_CONTENT_CHARACTERS,
  MAX_POST_PAGE_SIZE,
  MAX_POST_REQUEST_BODY_BYTES,
  MAX_POST_TITLE_CHARACTERS,
  POST_CONTENT_NAME,
  UserNoPassword,
} from "@home/shared";
import { createApiToken } from "../auth/createApiToken";
import { ApiMessage } from "../http/messages";
import { deletePostStorage } from "../fileOperations/postStorage";
import {
  afterEachPostTest,
  apiCall,
  beforeEachPostTest,
  breakPostStorage,
  CONTENT,
  createPost,
  currentRevision,
  expectFailure,
  HEADER_IMAGE_NAME,
  headerImageFile,
  imagePath,
  loggedErrors,
  makeUser,
  MARKDOWN_CONTENT_TYPE,
  MISSING_POST_ID,
  postPath,
  postResponse,
  postSummaryResponse,
  postWithoutHeaderImage,
  publishPost,
  responsePost,
  responseSummaries,
  savedPosts,
  storedFile,
  storedText,
  stubPostDelete,
  stubPostExists,
  stubPostList,
  stubPostLookup,
  stubSave,
  stubUserLookup,
  TITLE,
} from "../testFixtures/postTestFixtures";
import { storageControl } from "../testFixtures/storageTestControl";

vi.mock("../fileOperations/postStorage", async (importOriginal) => {
  const { failableStorage } =
    await import("../testFixtures/storageTestControl");

  return failableStorage(
    await importOriginal<typeof import("../fileOperations/postStorage")>(),
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

const editPost = (post: SavedPost, body: object, token?: string | null) =>
  apiCall("patch", postPath(post), { body, token });

describe("the blog post api", () => {
  beforeEach(beforeEachPostTest);

  afterEach(afterEachPostTest);

  describe("POST /api/v1/posts", () => {
    describe("a published post", () => {
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

      it("stores a title and content of a single character", async () => {
        const response = await createPost({ title: "a", content: "a" });

        const post = savedPosts[0];

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          ...publishedBody(post),
          post: postResponse(post, {
            title: "a",
            content: "a\n",
            headerImage: null,
          }),
        });

        await expect(
          storedText(currentRevision(post).content.file),
        ).resolves.toBe("a\n");
      });

      it("stores a title of the greatest length the api allows", async () => {
        const title = "a".repeat(MAX_POST_TITLE_CHARACTERS);

        const response = await createPost(postWithoutHeaderImage({ title }));

        expect(response.status).toBe(200);
        expect(responsePost(response).title).toBe(title);
      });

      it("counts a title's length after trimming it", async () => {
        const title = "a".repeat(MAX_POST_TITLE_CHARACTERS);

        const response = await createPost(
          postWithoutHeaderImage({ title: `  ${title}  ` }),
        );

        expect(response.status).toBe(200);
        expect(responsePost(response).title).toBe(title);
      });

      it("counts a title in characters rather than in code units", async () => {
        const title = "🌱".repeat(MAX_POST_TITLE_CHARACTERS);

        const response = await createPost(postWithoutHeaderImage({ title }));

        expect(response.status).toBe(200);
        expect(responsePost(response).title).toBe(title);
      });

      it("stores content of the greatest length the api allows", async () => {
        const content = "a".repeat(MAX_POST_CONTENT_CHARACTERS - 1);

        const response = await createPost(postWithoutHeaderImage({ content }));

        expect(response.status).toBe(200);
        expect(responsePost(response).content).toHaveLength(
          MAX_POST_CONTENT_CHARACTERS,
        );
      });

      it("trims and normalizes the title and the content it is given", async () => {
        const response = await createPost(
          postWithoutHeaderImage({
            title: "  Building the blog  ",
            content: "a\r\n\r\n\r\n\r\nb\r\n\r\n",
          }),
        );

        expect(response.status).toBe(200);
        expect(responsePost(response).title).toBe(TITLE);
        expect(responsePost(response).content).toBe("a\n\nb\n");
      });
    });

    describe("an author who may not publish", () => {
      it.each<[string, number, string, () => string | null]>([
        [
          "no authorization header",
          401,
          ApiMessage.UNAUTHENTICATED,
          () => null,
        ],
        [
          "a token this api did not sign",
          401,
          ApiMessage.UNAUTHENTICATED,
          () => "not.a.jwt",
        ],
        [
          "a token that is not an admin token",
          403,
          ApiMessage.FORBIDDEN,
          () => createApiToken(makeUser({ role: "user" })),
        ],
      ])("is refused for %s", async (_description, status, message, token) => {
        expectRejected(
          await createPost(postWithoutHeaderImage(), token()),
          status,
          message,
        );
      });

      it.each<[string, number, string, UserNoPassword | null]>([
        ["no longer has an account", 401, ApiMessage.UNAUTHENTICATED, null],
        [
          "has been banned since signing in",
          403,
          ApiMessage.FORBIDDEN,
          makeUser({ userBanned: true }),
        ],
        [
          "is no longer an admin",
          403,
          ApiMessage.FORBIDDEN,
          makeUser({ role: "user" }),
        ],
      ])(
        "is refused when the author %s",
        async (_description, status, message, author) => {
          stubUserLookup(author);

          expectRejected(
            await createPost(postWithoutHeaderImage()),
            status,
            message,
          );
        },
      );
    });

    describe("a request body the api will not accept", () => {
      it.each([
        ["a missing title", postWithoutHeaderImage({ title: undefined })],
        ["a title that is null", postWithoutHeaderImage({ title: null })],
        ["an empty title", postWithoutHeaderImage({ title: "" })],
        ["a blank title", postWithoutHeaderImage({ title: "   " })],
        [
          "a title of unicode spaces",
          postWithoutHeaderImage({ title: "\u00A0\u3000\uFEFF" }),
        ],
        ["a title that is not a string", postWithoutHeaderImage({ title: 7 })],
        [
          "an overlong title",
          postWithoutHeaderImage({
            title: "a".repeat(MAX_POST_TITLE_CHARACTERS + 1),
          }),
        ],
        [
          "an overlong title counted in characters",
          postWithoutHeaderImage({
            title: "🌱".repeat(MAX_POST_TITLE_CHARACTERS + 1),
          }),
        ],
        [
          "a title with bidirectional override characters",
          postWithoutHeaderImage({ title: "Building\u202Ethe blog" }),
        ],
        ["missing content", postWithoutHeaderImage({ content: undefined })],
        ["content that is null", postWithoutHeaderImage({ content: null })],
        ["empty content", postWithoutHeaderImage({ content: "" })],
        ["blank content", postWithoutHeaderImage({ content: " \n " })],
        [
          "content of only line breaks",
          postWithoutHeaderImage({ content: "\r\n\r\n\r" }),
        ],
        [
          "content that is not a string",
          postWithoutHeaderImage({ content: 7 }),
        ],
        [
          "content over the limit once it is normalized",
          postWithoutHeaderImage({
            content: "a".repeat(MAX_POST_CONTENT_CHARACTERS),
          }),
        ],
        [
          "content with control characters",
          postWithoutHeaderImage({ content: "Building\u0007the blog" }),
        ],
        [
          "content with raw html",
          postWithoutHeaderImage({ content: "<script>alert(1)</script>" }),
        ],
        [
          "an upload id that is not an upload id",
          postWithoutHeaderImage({ uploadId: "x" }),
        ],
      ])("is rejected for %s", async (_description, body) => {
        expectRejected(await createPost(body), 400, ApiMessage.INVALID_REQUEST);
      });
    });

    describe("a request body the api will not read", () => {
      it("is rejected when the body is larger than the api will parse", async () => {
        expectRejected(
          await createPost(
            postWithoutHeaderImage({
              content: "a".repeat(MAX_POST_REQUEST_BODY_BYTES),
            }),
          ),
          413,
          ApiMessage.REQUEST_TOO_LARGE,
        );
      });

      it("is rejected when the body is not the json it says it is", async () => {
        expectRejected(
          await apiCall("post", "")
            .set("Content-Type", "application/json")
            .send("{ not json"),
          400,
          ApiMessage.INVALID_REQUEST,
        );
      });
    });

    describe("a post that cannot be saved", () => {
      beforeEach(() => {
        stubSave(new Error("mongo is unreachable"));
      });

      it("removes the files it wrote once mongodb confirms the post was not saved", async () => {
        const exists = stubPostExists(false);

        const response = await createPost(postWithoutHeaderImage());

        const post = savedPosts[0];

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: true,
          message: ApiMessage.UNEXPECTED,
        });
        expect(exists).toHaveBeenCalledWith({ _id: post._id });

        await expect(
          storedFile(currentRevision(post).content.file),
        ).rejects.toThrow();
      });

      it("logs and keeps reporting the save failure when cleanup also fails", async () => {
        storageControl.cleanupFails = true;

        const response = await createPost(postWithoutHeaderImage());

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: true,
          message: ApiMessage.UNEXPECTED,
        });
        expect(loggedErrors).toContainEqual([
          `Failed to clean up storage for post ${savedPosts[0].fingerprint}:`,
          expect.any(Error),
        ]);
      });

      it("keeps the files when the post turns out to have been saved", async () => {
        stubPostExists(true);

        const response = await createPost(postWithoutHeaderImage());

        expect(response.status).toBe(500);

        await expect(
          storedFile(currentRevision(savedPosts[0]).content.file),
        ).resolves.toBeDefined();
      });

      it("keeps the files when mongodb cannot say whether the post was saved", async () => {
        stubPostExists(new Error("mongo is unreachable"));

        const response = await createPost(postWithoutHeaderImage());

        const post = savedPosts[0];

        expect(response.status).toBe(500);
        expect(loggedErrors).toContainEqual([
          `Kept storage for post ${post.fingerprint}, MongoDB could not confirm it was not saved:`,
          expect.any(Error),
        ]);

        await expect(
          storedFile(currentRevision(post).content.file),
        ).resolves.toBeDefined();
      });
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

    it("reports more pages when a page does not reach the last post", async () => {
      const post = await publishPost();
      stubPostList([post, post, post]);

      const response = await apiCall("get", "?page=1&pageSize=2");

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        pagination: { totalPages: 2, hasMore: true },
      });
    });

    it("lists a post that has no header image", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      stubPostList([post]);

      const response = await apiCall("get", "");

      expect(response.status).toBe(200);
      expect(responseSummaries(response)[0].headerImage).toBeNull();
    });

    it("lists a post whose author no longer has an account", async () => {
      const post = await publishPost();
      stubUserLookup(null);
      stubPostList([post]);

      const response = await apiCall("get", "");

      expect(response.status).toBe(200);
      expect(responseSummaries(response)[0].authorUsername).toBeNull();
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

    it("returns a null author when the author no longer has an account", async () => {
      const post = await publishPost();
      stubUserLookup(null);

      const response = await apiCall("get", postPath(post));

      expect(response.status).toBe(200);
      expect(responsePost(response).authorUsername).toBeNull();
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("get", `/${MISSING_POST_ID}`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("reports a post whose files are missing from storage", async () => {
      const post = await publishPost();
      await deletePostStorage(post.fingerprint);

      expectFailure(
        await apiCall("get", postPath(post)),
        500,
        ApiMessage.POST_FILES_UNAVAILABLE,
      );
    });

    it("reports a post that has no saved revision", async () => {
      const post = await publishPost();
      post.revisions.splice(0);

      expectFailure(
        await apiCall("get", postPath(post)),
        500,
        ApiMessage.POST_HAS_NO_REVISION,
      );
    });
  });

  describe("a reader who is not signed in", () => {
    it.each<[string, (post: SavedPost) => string]>([
      ["the list of posts", () => ""],
      ["a post", (post) => postPath(post)],
      ["a post's image", (post) => imagePath(post, HEADER_IMAGE_NAME)],
      [
        "a post's full size image",
        (post) => imagePath(post, HEADER_IMAGE_NAME, "/fullSize"),
      ],
    ])("can read %s", async (_description, path) => {
      const post = await publishPost();
      stubPostList([post]);

      const response = await apiCall("get", path(post), { token: null });

      expect(response.status).toBe(200);
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

    it("keeps the content when only the title changes", async () => {
      const post = await publishPost(postWithoutHeaderImage());

      const response = await editPost(post, { title: "Take two" });

      expect(response.status).toBe(200);
      expect(responsePost(response).content).toBe(CONTENT);

      await expect(
        storedText(currentRevision(post).content.file),
      ).resolves.toBe(CONTENT);
    });

    it("keeps the title when only the content changes", async () => {
      const post = await publishPost(postWithoutHeaderImage());

      const response = await editPost(post, { content: NEW_CONTENT });

      expect(response.status).toBe(200);
      expect(responsePost(response).title).toBe(TITLE);
      expect(post.title).toBe(TITLE);
    });

    it.each([
      ["a body that changes nothing", {}],
      ["a body that only asks to remove no images", { removeInlineImages: [] }],
      ["an empty title", { title: "" }],
      ["a blank title", { title: "   " }],
      ["a title that is not a string", { title: 7 }],
      [
        "an overlong title",
        { title: "a".repeat(MAX_POST_TITLE_CHARACTERS + 1) },
      ],
      ["a title that is explicitly null", { title: null }],
      ["empty content", { content: "" }],
      ["blank content", { content: " \n " }],
      ["content that is not a string", { content: 7 }],
      ["content that is explicitly null", { content: null }],
      [
        "content over the limit once it is normalized",
        { content: "a".repeat(MAX_POST_CONTENT_CHARACTERS) },
      ],
      ["content with raw html", { content: "<b>bold</b>" }],
      ["a header image that is not null", { headerImage: "cover.png" }],
      [
        "an inline image name the api does not allow",
        { title: "Take two", removeInlineImages: ["diagram.PNG"] },
      ],
      ["an upload id that is not an upload id", { uploadId: "x" }],
    ])("is rejected for %s", async (_description, body) => {
      const post = await publishPost(postWithoutHeaderImage());

      expectFailure(
        await editPost(post, body),
        400,
        ApiMessage.INVALID_REQUEST,
      );
      expect(post.revisions).toHaveLength(1);
    });

    it("reports a post whose files are missing from storage", async () => {
      const post = await publishPost();
      await deletePostStorage(post.fingerprint);

      expectFailure(
        await editPost(post, { title: "Take two" }),
        500,
        ApiMessage.POST_FILES_UNAVAILABLE,
      );
    });

    it("logs a revision it could not finish writing or clean up", async () => {
      const post = await publishPost();
      await breakPostStorage(post.fingerprint);

      const response = await editPost(post, { title: "Take two" });

      expect(response.status).toBe(500);
      expect(loggedErrors).toContainEqual([
        expect.stringContaining("Failed to clean up storage for revision"),
        expect.any(Error),
      ]);
    });

    it("removes the files of a revision once mongodb confirms it was not saved", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      stubSave(new Error("mongo is unreachable"));
      const exists = stubPostExists(false);

      const response = await editPost(post, { title: "Take two" });

      const revision = currentRevision(post);

      expect(response.status).toBe(500);
      expect(exists).toHaveBeenCalledWith({
        _id: post._id,
        "revisions.fingerprint": revision.fingerprint,
      });

      await expect(storedFile(revision.content.file)).rejects.toThrow();
      await expect(
        storedFile(post.revisions[0].content.file),
      ).resolves.toBeDefined();
    });

    it("keeps the files of a revision that turns out to have been saved", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      stubSave(new Error("mongo is unreachable"));
      stubPostExists(true);

      const response = await editPost(post, { title: "Take two" });

      expect(response.status).toBe(500);

      await expect(
        storedFile(currentRevision(post).content.file),
      ).resolves.toBeDefined();
    });

    it("reports a post that was changed while the edit was being saved and removes the revision's files", async () => {
      const post = await publishPost(postWithoutHeaderImage());
      stubSave(
        new MongooseError.VersionError(
          post as unknown as ConstructorParameters<
            typeof MongooseError.VersionError
          >[0],
          0,
          ["revisions"],
        ),
      );

      expectFailure(
        await editPost(post, { title: "Take two" }),
        409,
        ApiMessage.POST_CHANGED_DURING_UPDATE,
      );

      await expect(
        storedFile(currentRevision(post).content.file),
      ).rejects.toThrow();
      await expect(
        storedFile(post.revisions[0].content.file),
      ).resolves.toBeDefined();
    });

    it("is not found when the post does not exist", async () => {
      stubPostLookup(null);

      expectFailure(
        await apiCall("patch", `/${MISSING_POST_ID}`, {
          body: { title: "Take two" },
        }),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is forbidden for a token that is not an admin token", async () => {
      const post = await publishPost();

      expectFailure(
        await editPost(
          post,
          { title: "Take two" },
          createApiToken(makeUser({ role: "user" })),
        ),
        403,
        ApiMessage.FORBIDDEN,
      );
    });

    it("is refused when the author no longer has an account", async () => {
      const post = await publishPost();
      stubUserLookup(null);

      expectFailure(
        await editPost(post, { title: "Take two" }),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });
  });

  describe("DELETE /api/v1/posts/:id", () => {
    it("deletes the post and the files of every revision", async () => {
      const post = await publishPost();
      await editPost(post, { title: "Take two" });
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

    it("reports the post deleted when its files cannot be removed", async () => {
      const post = await publishPost();
      stubPostDelete(post);
      storageControl.cleanupFails = true;

      const response = await apiCall("delete", postPath(post));

      expect(response.status).toBe(200);
      expect(loggedErrors).toContainEqual([
        `Failed to clean up storage for post ${post.fingerprint}:`,
        expect.any(Error),
      ]);
    });

    it("is not found when the post does not exist", async () => {
      stubPostDelete(null);

      expectFailure(
        await apiCall("delete", `/${MISSING_POST_ID}`),
        404,
        ApiMessage.POST_NOT_FOUND,
      );
    });

    it("is unauthenticated without an authorization header", async () => {
      expectFailure(
        await apiCall("delete", `/${MISSING_POST_ID}`, { token: null }),
        401,
        ApiMessage.UNAUTHENTICATED,
      );
    });

    it("is forbidden when the author is no longer an admin", async () => {
      stubUserLookup(makeUser({ role: "user" }));

      expectFailure(
        await apiCall("delete", `/${MISSING_POST_ID}`),
        403,
        ApiMessage.FORBIDDEN,
      );
    });
  });

  describe("a request whose path or query the api will not accept", () => {
    it.each<[string, "get" | "patch" | "delete", string, object?]>([
      ["a page that is not a page number", "get", "?page=0"],
      [
        "a page size above the greatest the api allows",
        "get",
        `?pageSize=${MAX_POST_PAGE_SIZE + 1}`,
      ],
      ["a post id that is not an id", "get", "/not-an-id"],
      [
        "a post id that is not an id on an update",
        "patch",
        "/not-an-id",
        { title: "Take two" },
      ],
      ["a post id that is not an id on a delete", "delete", "/not-an-id"],
    ])("is rejected for %s", async (_description, method, path, body) => {
      expectFailure(
        await apiCall(method, path, { body }),
        400,
        ApiMessage.INVALID_REQUEST,
      );
    });
  });
});
