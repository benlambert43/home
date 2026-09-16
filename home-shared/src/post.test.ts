import { describe, expect, it } from "vitest";

import {
  postImagePath,
  postImageReference,
  postUploadImageNames,
} from "./post";

describe("postImagePath", () => {
  it("points at an image of a post on the api", () => {
    expect(postImagePath("0123456789abcdef01234567", "cover.png")).toBe(
      "posts/0123456789abcdef01234567/images/cover.png",
    );
  });
});

describe("postImageReference", () => {
  it("points at an image beside the post's markdown", () => {
    expect(postImageReference("diagram.png")).toBe("./images/diagram.png");
  });
});

describe("postUploadImageNames", () => {
  it("lists the header image before the inline images", () => {
    expect(
      postUploadImageNames({
        headerImage: "cover.png",
        inlineImages: ["diagram.png", "chart.jpg"],
      }),
    ).toEqual(["cover.png", "diagram.png", "chart.jpg"]);
  });
});
