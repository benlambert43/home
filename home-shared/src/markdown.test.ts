import { describe, expect, it } from "vitest";

import { containsRawHtml, normalizePostContent } from "./markdown";

const FENCE = "```";

const TILDE_FENCE = "~~~";

describe("normalizePostContent", () => {
  describe("line endings and encoding", () => {
    it("rewrites windows line endings", () => {
      expect(normalizePostContent("one\r\ntwo")).toBe("one\ntwo\n");
    });

    it("rewrites classic mac line endings", () => {
      expect(normalizePostContent("one\rtwo")).toBe("one\ntwo\n");
    });

    it("composes decomposed characters", () => {
      expect(normalizePostContent("café")).toBe("café\n");
    });
  });

  describe("horizontal whitespace", () => {
    it("expands a tab to the next four column stop", () => {
      expect(normalizePostContent("a\tb")).toBe("a   b\n");
    });

    it("expands a leading tab to a full indent", () => {
      expect(normalizePostContent("\tindented")).toBe("    indented\n");
    });

    it("strips a single trailing space", () => {
      expect(normalizePostContent("one \ntwo")).toBe("one\ntwo\n");
    });

    it("keeps a hard line break as exactly two spaces", () => {
      expect(normalizePostContent("one  \ntwo")).toBe("one  \ntwo\n");
      expect(normalizePostContent("one       \ntwo")).toBe("one  \ntwo\n");
    });

    it("drops a hard line break from the closing line", () => {
      expect(normalizePostContent("one\ntwo  ")).toBe("one\ntwo\n");
    });

    it("leaves leading indentation alone", () => {
      expect(normalizePostContent("- one\n  - two")).toBe("- one\n  - two\n");
    });
  });

  describe("vertical whitespace", () => {
    it("collapses a run of blank lines to one", () => {
      expect(normalizePostContent("# Title\n\n\n\n\npara")).toBe(
        "# Title\n\npara\n",
      );
    });

    it("treats a line of only whitespace as blank", () => {
      expect(normalizePostContent("# Title\n   \n\t\npara")).toBe(
        "# Title\n\npara\n",
      );
    });

    it("removes leading blank lines", () => {
      expect(normalizePostContent("\n\n# Title")).toBe("# Title\n");
    });

    it("removes trailing blank lines", () => {
      expect(normalizePostContent("# Title\n\n\n")).toBe("# Title\n");
    });

    it("adds a closing newline when there is none", () => {
      expect(normalizePostContent("# Title")).toBe("# Title\n");
    });

    it("keeps a single closing newline", () => {
      expect(normalizePostContent("# Title\n")).toBe("# Title\n");
    });
  });

  describe("content with nothing in it", () => {
    it.each([
      ["an empty string", ""],
      ["only spaces", "    "],
      ["only tabs", "\t\t"],
      ["only blank lines", "\n\n\n"],
      ["only mixed whitespace", " \n\t\n  \n"],
    ])("is empty for %s", (_description, content) => {
      expect(normalizePostContent(content)).toBe("");
    });
  });

  describe("fenced code blocks", () => {
    it("keeps tabs, blank runs, and trailing spaces inside a fence", () => {
      const content = `${FENCE}js\nconst a = 1;\tb   \n\n\n\nconst c = 2;\n${FENCE}`;

      expect(normalizePostContent(content)).toBe(`${content}\n`);
    });

    it("normalizes the prose on either side of a fence", () => {
      expect(
        normalizePostContent(
          `# Title \n\n\n${FENCE}\n\tcode\n${FENCE}\n\n\nend`,
        ),
      ).toBe(`# Title\n\n${FENCE}\n\tcode\n${FENCE}\n\nend\n`);
    });

    it("keeps a tilde fence intact", () => {
      const content = `${TILDE_FENCE}\ncode  \n${TILDE_FENCE}`;

      expect(normalizePostContent(content)).toBe(`${content}\n`);
    });

    it("recognises a fence indented up to three spaces", () => {
      const content = `   ${FENCE}\n\tcode\n   ${FENCE}`;

      expect(normalizePostContent(content)).toBe(`${content}\n`);
    });

    it("closes on a fence longer than the one that opened it", () => {
      const content = `${FENCE}\n\tcode\n${FENCE}\`\`\n\tprose`;

      expect(normalizePostContent(content)).toBe(
        `${FENCE}\n\tcode\n${FENCE}\`\`\n    prose\n`,
      );
    });

    it("stays open on a fence shorter than the one that opened it", () => {
      const content = `\`${FENCE}\n\tcode\n${FENCE}\n\tstill code`;

      expect(normalizePostContent(content)).toBe(`${content}\n`);
    });

    it("does not open a fence when the info string holds a backtick", () => {
      expect(normalizePostContent(`${FENCE} a \` b\n\tprose`)).toBe(
        `${FENCE} a \` b\n    prose\n`,
      );
    });

    it("leaves an unterminated fence open to the end", () => {
      expect(normalizePostContent(`${FENCE}\ncode   \n\n\n`)).toBe(
        `${FENCE}\ncode   \n`,
      );
    });
  });

  it("is unchanged by a second pass", () => {
    const content =
      "\r\n\r\n# Title   \r\n\r\n\r\n\r\nSome  \r\nprose.\t\r\n\r\n" +
      `${FENCE}js\nconst a = 1;\tb   \n\n\n\n${FENCE}\r\n\r\n\r\n`;
    const once = normalizePostContent(content);

    expect(normalizePostContent(once)).toBe(once);
  });
});

describe("containsRawHtml", () => {
  it.each([
    ["an opening tag", "<div>hi</div>"],
    ["a closing tag on its own", "the end</section>"],
    ["a self closing tag", "a<br/>b"],
    ["a tag with attributes", '<a href="https://example.com">link</a>'],
    ["a comment", "text\n<!-- a note -->\ntext"],
    ["a doctype declaration", "<!DOCTYPE html>"],
    ["a processing instruction", "<?php echo 1; ?>"],
    ["a cdata section", "<![CDATA[raw]]>"],
    ["a tag between two code spans", "`a` and <div> and `b`"],
  ])("finds %s", (_description, content) => {
    expect(containsRawHtml(content)).toBe(true);
  });

  it.each([
    [
      "plain markdown",
      "# Title\n\n- one\n- two\n\n[link](https://example.com)",
    ],
    ["an empty string", ""],
    ["a url autolink", "see <https://example.com> for details"],
    ["an email autolink", "mail <ben@example.com> about it"],
    ["a tag inside a code span", "use `<div>` for a box"],
    ["a tag inside a doubled code span", "``<div>``"],
    ["a tag inside a fenced block", `${FENCE}html\n<div>x</div>\n${FENCE}`],
    [
      "a tag inside a tilde fenced block",
      `${TILDE_FENCE}\n<div>x</div>\n${TILDE_FENCE}`,
    ],
    ["an escaped tag", "escaped \\<div\\> stays"],
    ["a comparison in prose", "true when a < b and c > d"],
  ])("passes over %s", (_description, content) => {
    expect(containsRawHtml(content)).toBe(false);
  });
});
