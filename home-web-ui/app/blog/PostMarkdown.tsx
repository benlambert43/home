import { Marked, Tokenizer } from "marked";
import Markdown, { ReactRenderer } from "marked-react";
import { ReactNode } from "react";

const URL_SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

const ALLOWED_URL_SCHEMES = ["http", "https", "mailto"];

const EXTERNAL_URL_SCHEMES = ["http", "https"];

// TODO: reject the `checkbox` token marked-react cannot parse, not filter it.
const baseTokenizer = new Tokenizer();

const marked = new Marked().use({
  tokenizer: {
    list(this: Tokenizer, src: string) {
      const list = baseTokenizer.list.call(this, src);

      list?.items.forEach((item) => {
        item.tokens = item.tokens.filter((token) => token.type !== "checkbox");
      });

      return list;
    },
  },
});

type CellAlignment = "left" | "center" | "right";

type CellFlags = { header?: boolean; align?: CellAlignment | null };

const CELL_ALIGNMENTS: Record<CellAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

type SafeUrl = { url: string; external: boolean };

const safeUrl = (url: string): SafeUrl | undefined => {
  const match = URL_SCHEME.exec(url.replace(/[\u0000-\u0020]/g, ""));

  if (!match) return { url, external: false };

  const scheme = match[1].toLowerCase();

  return ALLOWED_URL_SCHEMES.includes(scheme)
    ? { url, external: EXTERNAL_URL_SCHEMES.includes(scheme) }
    : undefined;
};

const renderer = {
  link(this: ReactRenderer, href: string, text: ReactNode) {
    const safe = safeUrl(href);

    if (!safe) return <span key={this.elementId}>{text}</span>;

    return (
      <a
        key={this.elementId}
        href={safe.url}
        target={safe.external ? "_blank" : undefined}
        rel={safe.external ? "noreferrer noopener" : undefined}
      >
        {text}
      </a>
    );
  },

  checkbox(this: ReactRenderer, checked: ReactNode) {
    return (
      <input
        key={this.elementId}
        type="checkbox"
        className="mr-2"
        checked={checked === true}
        disabled
        readOnly
      />
    );
  },

  tableCell(this: ReactRenderer, children: ReactNode[], flags: CellFlags) {
    const Cell = flags.header ? "th" : "td";

    return (
      <Cell
        key={this.elementId}
        className={flags.align ? CELL_ALIGNMENTS[flags.align] : undefined}
      >
        {children}
      </Cell>
    );
  },
};

const PostMarkdown = ({ content }: { content: string }) => (
  <div
    className="prose prose-invert prose-pre:bg-slate-900
      prose-code:before:content-none prose-code:after:content-none max-w-none"
  >
    <Markdown instance={marked} value={content} renderer={renderer} />
  </div>
);

export default PostMarkdown;
