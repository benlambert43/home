import { Marked, MarkedToken, Token } from "marked";
import { POST_IMAGE_REFERENCE_PREFIX } from "./post";
import { postHeadingId } from "./postSlug";

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

const FIRST_HEADING_MESSAGE =
  "Post content must start its headings at the top level. Please use a single # for the first heading.";

const SKIPPED_HEADING_MESSAGE =
  "Post content may not skip a heading level. Please go one level deeper at a time, such as ## after #.";

const DEEP_HEADING_MESSAGE =
  "Post content may only use three heading levels. Please use #, ##, or ### for headings.";

export const MAX_POST_HEADING_DEPTH = 3;

const MAX_POST_EXCERPT_CHARACTERS = 160;

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

const missingImageMessage = (reference: string) =>
  `Post content shows an image that is not added to the post: ${reference}`;

type LocatedToken = { token: MarkedToken; offset: number };

type LocatedProblem = { offset: number; message: string };

const childTokens = (token: MarkedToken): Token[] => {
  if (token.type === "list") return token.items;

  if (token.type === "table") {
    const cells = [token.header, ...token.rows].reduce(
      (all, row) => [...all, ...row],
      [],
    );

    return cells.reduce<Token[]>((all, cell) => [...all, ...cell.tokens], []);
  }

  return "tokens" in token ? (token.tokens ?? []) : [];
};

const locateTokens = (
  content: string,
  tokens: Token[],
  start: number,
  located: LocatedToken[] = [],
) => {
  let cursor = start;

  for (const token of tokens) {
    const found = content.indexOf(token.raw, cursor);
    const offset = found === -1 ? cursor : found;
    if (found !== -1) cursor = found + token.raw.length;

    located.push({ token: token as MarkedToken, offset });
    locateTokens(content, childTokens(token as MarkedToken), offset, located);
  }

  return located;
};

const tokenProblem = (
  token: MarkedToken,
  imageReferences: Set<string> | undefined,
) => {
  if (token.type === "html") return HTML_MESSAGE;

  if (token.type === "checkbox") return TASK_LIST_MESSAGE;

  if (token.type === "image") {
    if (!token.href.startsWith(POST_IMAGE_REFERENCE_PREFIX)) {
      return EXTERNAL_IMAGE_MESSAGE;
    }

    return imageReferences === undefined || imageReferences.has(token.href)
      ? undefined
      : missingImageMessage(token.href);
  }

  if (token.type !== "link") return undefined;

  if (flattenTokens(token.tokens).some(({ type }) => type === "image")) {
    return LINKED_IMAGE_MESSAGE;
  }

  return ALLOWED_LINK.test(token.href) ? undefined : LINK_MESSAGE;
};

const headingProblems = (tokens: LocatedToken[]) => {
  const problems: LocatedProblem[] = [];
  let previousDepth = 0;

  for (const { token, offset } of tokens) {
    if (token.type !== "heading") continue;

    if (token.depth > MAX_POST_HEADING_DEPTH) {
      problems.push({ offset, message: DEEP_HEADING_MESSAGE });
    } else if (token.depth > previousDepth + 1) {
      problems.push({
        offset,
        message:
          previousDepth === 0 ? FIRST_HEADING_MESSAGE : SKIPPED_HEADING_MESSAGE,
      });
    }

    previousDepth = token.depth;
  }

  return problems;
};

const lineNumber = (content: string, offset: number) =>
  content.slice(0, offset).split("\n").length;

export const postMarkdownProblems = (
  content: string,
  imageReferences?: string[],
) => {
  const tokens = locateTokens(content, markdown.lexer(content), 0);
  const references = imageReferences && new Set(imageReferences);
  const problems: LocatedProblem[] = [];

  for (const { token, offset } of tokens) {
    const message = tokenProblem(token, references);
    if (message !== undefined) problems.push({ offset, message });
  }

  return [
    ...new Set(
      [...problems, ...headingProblems(tokens)]
        .sort((a, b) => a.offset - b.offset)
        .map(
          ({ offset, message }) =>
            `Line ${lineNumber(content, offset)}: ${message}`,
        ),
    ),
  ];
};

export const isExternalPostLink = (href: string) => EXTERNAL_LINK.test(href);

const proseText = (tokens: Token[], separator: string): string =>
  (tokens as MarkedToken[]).map(tokenProse).join(separator);

const tokenProse = (token: MarkedToken): string => {
  switch (token.type) {
    case "paragraph":
    case "strong":
    case "em":
    case "del":
    case "link":
      return proseText(token.tokens, "");
    case "blockquote":
    case "list_item":
      return proseText(token.tokens, " ");
    case "list":
      return proseText(token.items, " ");
    case "text":
      return token.tokens ? proseText(token.tokens, "") : token.text;
    case "escape":
    case "codespan":
      return token.text;
    case "br":
      return " ";
    default:
      return "";
  }
};

export const postHeadingIds = (content: string) => {
  const ids = new Set<string>();

  for (const token of flattenTokens(markdown.lexer(content))) {
    if (token.type !== "heading") continue;

    const text = proseText(token.tokens, "");
    let attempt = 1;
    while (ids.has(postHeadingId(text, attempt))) attempt += 1;

    ids.add(postHeadingId(text, attempt));
  }

  return [...ids];
};

const truncatedAtWord = (text: string, maxCharacters: number) => {
  const characters = [...text];
  if (characters.length <= maxCharacters) return text;

  const head = characters.slice(0, maxCharacters).join("");
  const wordEnd = head.lastIndexOf(" ");
  const kept =
    wordEnd >= head.length / 2
      ? head.slice(0, wordEnd)
      : characters.slice(0, maxCharacters - 1).join("");

  return `${kept.replace(/[\s.,;:!?]+$/, "")}…`;
};

export const postExcerpt = (content: string) => {
  const prose = proseText(markdown.lexer(content), " ")
    .replace(/\s+/g, " ")
    .trim();

  return prose.length === 0
    ? undefined
    : truncatedAtWord(prose, MAX_POST_EXCERPT_CHARACTERS);
};
