import type { Extensions, JSONContent } from "@tiptap/core";
import { CodeBlock } from "@tiptap/extension-code-block";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Image } from "@tiptap/extension-image";
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

const PostParagraph = Paragraph.extend({
  parseMarkdown: (token, helpers) =>
    helpers.createNode(
      "paragraph",
      undefined,
      helpers.parseInline(token.tokens ?? []),
    ),

  renderMarkdown: (node, helpers) =>
    node.content?.length
      ? escapeParagraph(helpers.renderChildren(node.content))
      : "",
});

const PostHardBreak = HardBreak.extend({ renderMarkdown: () => "\\\n" });

const quoted = (text: string) => text.replace(/["\\]/g, "\\$&");

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

const PostTable = Table.extend({
  renderMarkdown: (node, helpers) =>
    renderTableToMarkdown(
      {
        ...node,
        content: node.content?.map((row) => ({
          ...row,
          content: row.content?.map(singleLineCell),
        })),
      },
      helpers,
    ),
});

const PostTableCell = TableCell.extend({ content: "paragraph" });

const PostTableHeader = TableHeader.extend({ content: "paragraph" });

const PostMarkdown = Markdown.extend({
  onCreate() {
    if (this.editor.markdown) applyPostTextEscaping(this.editor.markdown);
  },
});

export const postMarkdownExtensions = (): Extensions => [
  StarterKit.configure({
    underline: false,
    paragraph: false,
    hardBreak: false,
    codeBlock: false,
    link: { openOnClick: false },
  }),
  PostParagraph,
  PostHardBreak,
  PostCodeBlock,
  PostTable,
  TableRow,
  PostTableCell,
  PostTableHeader,
  PostMarkdown,
];
