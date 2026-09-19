import { Marked, MarkedToken, Token } from "marked";
import { POST_IMAGE_REFERENCE_PREFIX } from "./post";

const TAB_SIZE = 4;

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})(.*)$/;

const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;

const ALLOWED_LINK = /^(?:https?:\/\/|mailto:|\/(?![/\\]))/i;

const EXTERNAL_LINK = /^https?:\/\//i;

const HTML_MESSAGE =
  "Post content may not contain HTML. Please use Markdown instead.";

const TASK_LIST_MESSAGE =
  "Post content may not contain task lists. Please use a plain list instead.";

const LINKED_IMAGE_MESSAGE = "Post content may not put an image inside a link.";

const EXTERNAL_IMAGE_MESSAGE =
  "Post content may only show images that are added to the post.";

const LINK_MESSAGE =
  "Links in post content must start with https://, http://, mailto:, or /.";

const markdown = new Marked();

const expandTabs = (line: string) => {
  let expanded = "";

  for (const character of line) {
    expanded +=
      character === "\t"
        ? " ".repeat(TAB_SIZE - (expanded.length % TAB_SIZE))
        : character;
  }

  return expanded;
};

const tidyLine = (line: string) => expandTabs(line).replace(/ +$/, "");

const openingFence = (line: string) => {
  const match = FENCE_OPEN.exec(line);
  if (!match) return undefined;

  return match[1].startsWith("`") && match[2].includes("`")
    ? undefined
    : match[1];
};

const closesFence = (line: string, fence: string) => {
  const match = FENCE_CLOSE.exec(line);

  return (
    match !== null &&
    match[1].startsWith(fence[0]) &&
    match[1].length >= fence.length
  );
};

export const normalizePostContent = (content: string) => {
  const lines = content.normalize("NFC").replace(/\r\n?/g, "\n").split("\n");

  const normalized: string[] = [];
  let fence: string | undefined;

  for (const line of lines) {
    if (fence !== undefined) {
      normalized.push(line);
      if (closesFence(line, fence)) fence = undefined;
      continue;
    }

    const tidied = tidyLine(line);

    if (tidied.length === 0) {
      if (normalized.length > 0 && normalized[normalized.length - 1] !== "") {
        normalized.push("");
      }
      continue;
    }

    fence = openingFence(tidied);
    normalized.push(tidied);
  }

  while (normalized[normalized.length - 1] === "") normalized.pop();

  return normalized.length === 0 ? "" : `${normalized.join("\n")}\n`;
};

const flattenTokens = (tokens: Token[]) => {
  const flattened: MarkedToken[] = [];

  void markdown.walkTokens(tokens, (token) => {
    flattened.push(token as MarkedToken);
  });

  return flattened;
};

const tokenProblem = (token: MarkedToken) => {
  if (token.type === "html") return HTML_MESSAGE;

  if (token.type === "checkbox") return TASK_LIST_MESSAGE;

  if (token.type === "image") {
    return token.href.startsWith(POST_IMAGE_REFERENCE_PREFIX)
      ? undefined
      : EXTERNAL_IMAGE_MESSAGE;
  }

  if (token.type !== "link") return undefined;

  if (flattenTokens(token.tokens).some(({ type }) => type === "image")) {
    return LINKED_IMAGE_MESSAGE;
  }

  return ALLOWED_LINK.test(token.href) ? undefined : LINK_MESSAGE;
};

export const disallowedPostMarkdown = (content: string) => {
  for (const token of flattenTokens(markdown.lexer(content))) {
    const problem = tokenProblem(token);
    if (problem !== undefined) return problem;
  }

  return undefined;
};

export const postImageReferences = (content: string) => [
  ...new Set(
    flattenTokens(markdown.lexer(content))
      .filter((token) => token.type === "image")
      .map((token) => token.href),
  ),
];

export const isExternalPostLink = (href: string) => EXTERNAL_LINK.test(href);
