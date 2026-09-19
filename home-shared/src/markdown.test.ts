import { describe, expect, it } from "vitest";

import { disallowedPostMarkdown, normalizePostContent } from "./markdown";

describe("normalizePostContent", () => {
  it("collapses a run of blank lines to one", () => {
    expect(normalizePostContent("# Title\n\n\n\n\npara")).toBe(
      "# Title\n\npara\n",
    );
  });
});

describe("disallowedPostMarkdown", () => {
  it("passes over plain markdown", () => {
    expect(
      disallowedPostMarkdown(
        "# Title\n\n- one\n- two\n\n[link](https://example.com)",
      ),
    ).toBeUndefined();
  });

  it("finds an opening tag", () => {
    expect(disallowedPostMarkdown("<div>hi</div>")).toBe(
      "Post content may not contain HTML. Please use Markdown instead.",
    );
  });
});
