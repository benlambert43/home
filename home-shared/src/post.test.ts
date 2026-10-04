import { describe, expect, it } from "vitest";

import {
  postImagePath,
  postImageReference,
  postUploadImageNames,
} from "./post";

describe("postImagePath", () => {
  it("points at an image of a post on the api", () => {
    expect(postImagePath("building-the-blog", "cover.png")).toBe(
      "posts/building-the-blog/images/cover.png",
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
