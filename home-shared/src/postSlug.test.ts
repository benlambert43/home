import { describe, expect, it } from "vitest";

import { postSlug } from "./postSlug";

describe("postSlug", () => {
  it("lowercases the title and joins its words with hyphens", () => {
    expect(postSlug("Hello, World!")).toBe("hello-world");
  });
});
