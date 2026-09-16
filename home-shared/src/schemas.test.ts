import { describe, expect, it } from "vitest";

import { MAX_POST_INLINE_IMAGES } from "./post";
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

  it("refuses an empty title", () => {
    expect(
      createPostBodySchema.safeParse({ title: "", content: "A first post." })
        .success,
    ).toBe(false);
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

  it("reports an empty title on its own field", () => {
    expect(
      createPostFormSchema.safeParse({ title: "", content: "A first post." })
        .error?.issues,
    ).toEqual([
      expect.objectContaining({
        path: ["title"],
        message: "Please enter a post title.",
      }),
    ]);
  });
});

describe("updatePostBodySchema", () => {
  it("accepts an edit that has a new title", () => {
    expect(updatePostBodySchema.safeParse({ title: "Take two" }).success).toBe(
      true,
    );
  });

  it("refuses an edit that has nothing to change", () => {
    expect(updatePostBodySchema.safeParse({}).success).toBe(false);
  });
});

describe("createPostUploadBodySchema", () => {
  it("accepts a header image alongside inline images", () => {
    expect(
      createPostUploadBodySchema.safeParse({
        headerImage: "cover.png",
        inlineImages: ["diagram.png", "chart.jpg"],
      }).success,
    ).toBe(true);
  });

  it("refuses more inline images than a post may add at once", () => {
    expect(
      createPostUploadBodySchema.safeParse({
        inlineImages: inlineImageNames(MAX_POST_INLINE_IMAGES + 1),
      }).success,
    ).toBe(false);
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
