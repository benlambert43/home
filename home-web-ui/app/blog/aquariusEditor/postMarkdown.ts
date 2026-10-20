import {
  Extension,
  type Extensions,
  type JSONContent,
  type MarkdownRendererHelpers,
} from "@tiptap/core";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { BulletList, OrderedList } from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import {
  renderTableToMarkdown,
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import { Markdown, MarkdownManager } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";
import { decode } from "html-entities";

export const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export type HeadingLevel = (typeof HEADING_LEVELS)[number];

export const LIST_ITEM = "listItem";

const INLINE_SYNTAX = /[\\`*_[\]~<|]/g;

const ENTITY_AMPERSAND = /&(?=#?\w+;)/g;

const LEADING_SPACE = /^[ \t]+/;

const BLOCK_START =
  /^( {0,3})(#{1,6}(?=[ \t]|$)|>|[-+](?=[ \t]|$)|(?:-{3,}|={3,})[ \t]*$)/;

const ORDERED_START = /^( {0,3}\d{1,9})([.)])(?=[ \t]|$)/;

const CODE_INDENT_COLUMNS = 4;

const SPACE: JSONContent = { type: "text", text: " " };

const NAMED_ENTITY = /&[a-z][a-z\d]*;/i;

const LEADING_NAMED_ENTITY = /^&[a-z][a-z\d]*;/i;

const LINK_DESTINATION_ESCAPES = /[\\()]/g;

const WHITESPACE = /\s/g;

const LIST_TYPES = new Set(["bulletList", "orderedList"]);

type TextEncoding = (
  text: string,
  node: JSONContent,
  parentNode?: JSONContent,
) => string;

const escapePostText = (text: string) =>
  text.replace(INLINE_SYNTAX, "\\$&").replace(ENTITY_AMPERSAND, "\\&");

const inCode = (node: JSONContent, parentNode?: JSONContent) =>
  parentNode?.type === "codeBlock" ||
  (node.marks ?? []).some((mark) => mark.type === "code");

const applyPostTextEscaping = (manager: MarkdownManager) => {
  const encoding = manager as unknown as {
    encodeTextForMarkdown: TextEncoding;
  };

  encoding.encodeTextForMarkdown = (text, node, parentNode) =>
    inCode(node, parentNode) ? text : escapePostText(text);
};

const withoutCodeIndent = (line: string) =>
  line.replace(LEADING_SPACE, (indent) =>
    indent.replace(/\t/g, " ".repeat(CODE_INDENT_COLUMNS)).length >=
    CODE_INDENT_COLUMNS
      ? ""
      : indent,
  );

const escapeBlockStart = (line: string) =>
  withoutCodeIndent(line)
    .replace(BLOCK_START, "$1\\$2")
    .replace(ORDERED_START, "$1\\$2");

const escapeParagraph = (markdown: string) =>
  markdown.split("\n").map(escapeBlockStart).join("\n");

const isBlankInline = (node: JSONContent) =>
  node.type === "hardBreak" ||
  (node.type === "text" && (node.text ?? "").trim() === "");

const isBlankParagraph = (node: JSONContent) =>
  node.type === "paragraph" && (node.content ?? []).every(isBlankInline);

const withoutTrailingBreaks = (content: JSONContent[]) => {
  const end = content.findLastIndex((node) => !isBlankInline(node)) + 1;

  return content.slice(end).some((node) => node.type === "hardBreak")
    ? content.slice(0, end)
    : content;
};

const PostParagraph = Paragraph.extend({
  parseMarkdown: (token, helpers) =>
    helpers.createNode(
      "paragraph",
      undefined,
      helpers.parseInline(token.tokens ?? []),
    ),

  renderMarkdown: (node, helpers) => {
    const content = withoutTrailingBreaks(node.content ?? []);

    return content.length
      ? escapeParagraph(helpers.renderChildren(content))
      : "";
  },
});

const PostHardBreak = HardBreak.extend({
  renderMarkdown: (_node, _helpers, context) =>
    context.parentType === "heading" ? " " : "\\\n",
});

const quoted = (text: string) => text.replace(/["\\]/g, "\\$&");

const linkDestination = (href: string) =>
  href
    .replace(LINK_DESTINATION_ESCAPES, "\\$&")
    .replace(WHITESPACE, encodeURIComponent);

const PostLink = Link.extend({
  renderMarkdown: (node, helpers) => {
    const href = typeof node.attrs?.href === "string" ? node.attrs.href : "";
    const title = typeof node.attrs?.title === "string" ? node.attrs.title : "";
    const text = helpers.renderChildren(node);

    return title
      ? `[${text}](${linkDestination(href)} "${quoted(title)}")`
      : `[${text}](${linkDestination(href)})`;
  },
}).configure({ openOnClick: false });

const PostEntity = Extension.create({
  name: "postEntity",

  markdownTokenizer: {
    name: "postEntity",
    level: "inline",
    start: (src) => src.search(NAMED_ENTITY),
    tokenize: (src) => {
      const raw = LEADING_NAMED_ENTITY.exec(src)?.[0];
      const text = raw && decode(raw);

      return raw && text !== raw
        ? { type: "postEntity", raw, text }
        : undefined;
    },
  },

  parseMarkdown: (token, helpers) => helpers.createTextNode(token.text ?? ""),
});

export const PostImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-src") ?? element.getAttribute("src"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-src": attributes.src,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "img[data-src]" }, ...(this.parent?.() ?? [])];
  },

  renderMarkdown: (node) => {
    const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
    const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
    const title = typeof node.attrs?.title === "string" ? node.attrs.title : "";
    const label = alt.replace(/[\\[\]]/g, "\\$&");

    return title
      ? `![${label}](${src} "${quoted(title)}")`
      : `![${label}](${src})`;
  },
}).configure({ inline: true });

const BACKTICK_RUNS = /`+/g;

const MIN_CODE_FENCE = 3;

const codeFence = (code: string) => {
  const longest = Math.max(
    0,
    ...(code.match(BACKTICK_RUNS) ?? []).map((run) => run.length),
  );

  return "`".repeat(Math.max(MIN_CODE_FENCE, longest + 1));
};

const PostCodeBlock = CodeBlock.extend({
  renderMarkdown: (node, helpers) => {
    const language =
      typeof node.attrs?.language === "string" ? node.attrs.language : "";
    const code = node.content ? helpers.renderChildren(node.content) : "";
    const fence = codeFence(code);

    return `${fence}${language}\n${code}\n${fence}`;
  },
});

const singleLineCell = (cell: JSONContent): JSONContent => ({
  ...cell,
  content: [
    {
      type: "paragraph",
      content: (cell.content ?? []).flatMap((block, index) => [
        ...(index > 0 ? [SPACE] : []),
        ...(block.content ?? []).map((inline) =>
          inline.type === "hardBreak" ? SPACE : inline,
        ),
      ]),
    },
  ],
});

const singleLineRow = (row: JSONContent, index: number): JSONContent => ({
  ...row,
  content: row.content?.map((cell) => ({
    ...singleLineCell(cell),
    type: index === 0 ? "tableHeader" : cell.type,
  })),
});

const PostTable = Table.extend({
  renderMarkdown: (node, helpers) =>
    renderTableToMarkdown(
      { ...node, content: node.content?.map(singleLineRow) },
      helpers,
    ),
});

const PostTableCell = TableCell.extend({ content: "paragraph" });

const PostTableHeader = TableHeader.extend({ content: "paragraph" });

const separateAdjacentLists = (node: JSONContent): JSONContent => {
  let previous: JSONContent | undefined;

  const content = node.content?.map((child) => {
    const separated = separateAdjacentLists(child);
    if (isBlankParagraph(separated)) return separated;

    const alternate =
      LIST_TYPES.has(separated.type ?? "") &&
      previous?.type === separated.type &&
      previous?.attrs?.alternateMarker !== true;

    previous = alternate
      ? {
          ...separated,
          attrs: { ...separated.attrs, alternateMarker: true },
        }
      : separated;

    return previous;
  });

  return content ? { ...node, content } : node;
};

const PostDocument = Document.extend({
  renderMarkdown: (node, helpers) =>
    helpers.renderChildren(separateAdjacentLists(node).content ?? [], "\n\n"),
});

const renderListItems = (
  node: JSONContent,
  helpers: MarkdownRendererHelpers,
  marker: RegExp,
  alternateMarker: string,
) => {
  const items = node.content ? helpers.renderChildren(node.content, "\n") : "";

  return node.attrs?.alternateMarker === true
    ? items.replace(marker, alternateMarker)
    : items;
};

const PostBulletList = BulletList.extend({
  renderMarkdown: (node, helpers) =>
    renderListItems(node, helpers, /^- /gm, "* "),
});

const PostOrderedList = OrderedList.extend({
  markdownTokenizer: {
    name: "orderedList",
    level: "block",
    start: () => -1,
    tokenize: () => undefined,
  },

  renderMarkdown: (node, helpers) =>
    renderListItems(node, helpers, /^(\d+)\. /gm, "$1) "),
});

const PostMarkdown = Markdown.extend({
  onCreate() {
    if (this.editor.markdown) applyPostTextEscaping(this.editor.markdown);
  },
});

export const postMarkdownExtensions = (): Extensions => [
  StarterKit.configure({
    document: false,
    underline: false,
    paragraph: false,
    hardBreak: false,
    codeBlock: false,
    bulletList: false,
    orderedList: false,
    link: false,
  }),
  PostDocument,
  PostParagraph,
  PostHardBreak,
  PostCodeBlock,
  PostBulletList,
  PostOrderedList,
  PostLink,
  PostEntity,
  PostTable,
  TableRow,
  PostTableCell,
  PostTableHeader,
  PostMarkdown,
];
