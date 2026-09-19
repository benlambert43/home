import { describe, expect, it } from "vitest";

import { disallowedPostMarkdown, normalizePostContent } from "./markdown";

describe("normalizePostContent", () => {
  it("uses unix line endings and ends with a single newline", () => {
    expect(normalizePostContent("# Title\r\n\r\npara\r\n\r\n")).toBe(
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
