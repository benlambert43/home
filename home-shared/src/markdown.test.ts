import { describe, expect, it } from "vitest";

import { containsRawHtml, normalizePostContent } from "./markdown";

describe("normalizePostContent", () => {
  it("collapses a run of blank lines to one", () => {
    expect(normalizePostContent("# Title\n\n\n\n\npara")).toBe(
      "# Title\n\npara\n",
    );
  });
});

describe("containsRawHtml", () => {
  it("passes over plain markdown", () => {
    expect(
      containsRawHtml("# Title\n\n- one\n- two\n\n[link](https://example.com)"),
    ).toBe(false);
  });

  it("finds an opening tag", () => {
    expect(containsRawHtml("<div>hi</div>")).toBe(true);
  });
});
