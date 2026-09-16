import { describe, expect, it } from "vitest";

import { MAX_POST_INLINE_IMAGES, MAX_POST_TITLE_CHARACTERS } from "./post";
import {
  createPostBodySchema,
  createPostFormSchema,
  createPostUploadBodySchema,
  postUploadParamsSchema,
  signInBodySchema,
  updatePostBodySchema,
} from "./schemas";

const UPLOAD_ID = "0123456789abcdef0123456789abcdef";

const inlineImageNames = (count: number) =>
  Array.from({ length: count }, (_value, index) => `diagram-${index}.png`);

describe("signInBodySchema", () => {
  it("parses a well-formed sign-in body without errors", () => {
    const result = signInBodySchema.safeParse({
      email: "someone@example.com",
      password: "correcthorsebattery",
    });

    expect(result.success).toBe(true);
  });
});

describe("createPostBodySchema", () => {
  it("parses a post that is only a title and content", () => {
    const result = createPostBodySchema.safeParse({
      title: "Building the blog",
      content: "A first post.",
    });

    expect(result.data).toEqual({
      title: "Building the blog",
      content: "A first post.\n",
    });
  });

  it("parses a post whose images are waiting in an upload, lowercasing the upload id", () => {
    const result = createPostBodySchema.safeParse({
      title: "Building the blog",
      content: "A first post.",
      uploadId: UPLOAD_ID.toUpperCase(),
    });

    expect(result.data?.uploadId).toBe(UPLOAD_ID);
  });

  it("trims the title and normalizes the content", () => {
    const result = createPostBodySchema.safeParse({
      title: "  Building the blog  ",
      content: "A first post.\r\n\r\n\r\n\r\nAnd more.",
    });

    expect(result.data).toEqual({
      title: "Building the blog",
      content: "A first post.\n\nAnd more.\n",
    });
  });

  it("composes a title before counting its characters", () => {
    const result = createPostBodySchema.safeParse({
      title: "e\u0301".repeat(MAX_POST_TITLE_CHARACTERS),
      content: "A first post.",
    });

    expect(result.data?.title).toBe("\u00e9".repeat(MAX_POST_TITLE_CHARACTERS));
  });

  it.each([
    ["a title of a single character", { title: "a", content: "a" }],
    ["content of a single character", { title: "Title", content: "a" }],
  ])("accepts %s", (_description, body) => {
    expect(createPostBodySchema.safeParse(body).success).toBe(true);
  });

  it.each([
    ["a missing title", { content: "A first post." }],
    ["an empty title", { title: "", content: "A first post." }],
    ["a blank title", { title: "   ", content: "A first post." }],
    ["missing content", { title: "Building the blog" }],
    ["empty content", { title: "Building the blog", content: "" }],
    ["blank content", { title: "Building the blog", content: " \n\t " }],
  ])("refuses %s", (_description, body) => {
    expect(createPostBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("createPostFormSchema", () => {
  it("asks an author for a title and content and nothing else", () => {
    const result = createPostFormSchema.safeParse({
      title: "Building the blog",
      content: "A first post.",
      uploadId: UPLOAD_ID,
    });

    expect(result.data).toEqual({
      title: "Building the blog",
      content: "A first post.\n",
    });
  });
});

describe("createPostFormSchema reports", () => {
  it.each([
    [
      "an empty title",
      { title: "", content: "A first post." },
      "title",
      "Please enter a post title.",
    ],
    [
      "a blank title",
      { title: "   ", content: "A first post." },
      "title",
      "Please enter a post title.",
    ],
    [
      "empty content",
      { title: "Building the blog", content: "" },
      "content",
      "Please write some post content.",
    ],
    [
      "blank content",
      { title: "Building the blog", content: " \n " },
      "content",
      "Please write some post content.",
    ],
  ])("%s on its own field", (_description, body, field, message) => {
    expect(createPostFormSchema.safeParse(body).error?.issues).toEqual([
      expect.objectContaining({ path: [field], message }),
    ]);
  });
});

describe("updatePostBodySchema", () => {
  it.each([
    ["a new title", { title: "Take two" }],
    ["new content", { content: "The post, rewritten." }],
    ["a header image to remove", { headerImage: null }],
    ["images to add", { uploadId: UPLOAD_ID }],
    ["inline images to remove", { removeInlineImages: ["diagram.png"] }],
    [
      "a new title and no inline images to remove",
      { title: "Take two", removeInlineImages: [] },
    ],
  ])("accepts an edit that has %s", (_description, body) => {
    expect(updatePostBodySchema.safeParse(body).success).toBe(true);
  });

  it("keeps a header image removal as null", () => {
    expect(updatePostBodySchema.safeParse({ headerImage: null }).data).toEqual({
      headerImage: null,
    });
  });

  it("lowercases the upload id of an edit", () => {
    expect(
      updatePostBodySchema.safeParse({ uploadId: UPLOAD_ID.toUpperCase() })
        .data,
    ).toEqual({ uploadId: UPLOAD_ID });
  });

  it.each([
    ["nothing to change", {}],
    ["no inline images to remove", { removeInlineImages: [] }],
    ["a blank title", { title: "   " }],
    ["blank content", { content: "  " }],
    ["a header image that is not null", { headerImage: "cover.png" }],
    ["an inline image name it does not allow", { removeInlineImages: ["a"] }],
  ])("refuses an edit that has %s", (_description, body) => {
    expect(updatePostBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("createPostUploadBodySchema", () => {
  it("accepts an upload that expects no images", () => {
    expect(
      createPostUploadBodySchema.safeParse({ inlineImages: [] }).success,
    ).toBe(true);
  });

  it("accepts a header image alongside inline images", () => {
    expect(
      createPostUploadBodySchema.safeParse({
        headerImage: "cover.png",
        inlineImages: ["diagram.png", "chart.jpg"],
      }).success,
    ).toBe(true);
  });

  it("does not count the header image towards the inline image limit", () => {
    expect(
      createPostUploadBodySchema.safeParse({
        headerImage: "cover.png",
        inlineImages: inlineImageNames(MAX_POST_INLINE_IMAGES),
      }).success,
    ).toBe(true);
  });

  it.each([
    [
      "two inline images whose names differ only in case",
      { inlineImages: ["a.png", "A.png"] },
    ],
    [
      "a header image sharing a name with an inline image",
      { headerImage: "a.png", inlineImages: ["a.png"] },
    ],
    [
      "a header image whose name differs from an inline image only in case",
      { headerImage: "Cover.png", inlineImages: ["cover.png"] },
    ],
    [
      "a header image without a list of inline images",
      { headerImage: "a.png" },
    ],
    ["a header image that is null", { headerImage: null, inlineImages: [] }],
    [
      "more inline images than a post may add at once",
      { inlineImages: inlineImageNames(MAX_POST_INLINE_IMAGES + 1) },
    ],
  ])("refuses %s", (_description, body) => {
    expect(createPostUploadBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("postUploadParamsSchema", () => {
  it("lowercases the upload id in a route", () => {
    expect(
      postUploadParamsSchema.safeParse({ uploadId: UPLOAD_ID.toUpperCase() })
        .data,
    ).toEqual({ uploadId: UPLOAD_ID });
  });

  it("refuses an upload id that is not an upload id", () => {
    expect(postUploadParamsSchema.safeParse({ uploadId: "x" }).success).toBe(
      false,
    );
  });
});
