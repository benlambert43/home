import { Marked, MarkedToken, Token } from "marked";
import { POST_IMAGE_REFERENCE_PREFIX } from "./post";

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

export const normalizePostContent = (content: string) => {
  const normalized = content
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/\s+$/, "");

  return normalized.length === 0 ? "" : `${normalized}\n`;
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
