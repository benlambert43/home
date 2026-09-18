import PostImageLightbox from "@/app/blog/PostImageLightbox";
import { postImageNameFromReference } from "@home/shared";
import { Marked, Tokenizer } from "marked";
import Markdown, { ReactRenderer } from "marked-react";
import Image from "next/image";
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

export type PostMarkdownImage = {
  reference: string;
  src: string;
  href?: string;
  width?: number;
  height?: number;
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

const imageSize = ({ width, height }: PostMarkdownImage) =>
  width === undefined || height === undefined
    ? { width: 0, height: 0, sizes: "100vw", className: "w-full" }
    : { width, height };

const MarkdownImage = ({
  image,
  alt,
  title,
}: {
  image: PostMarkdownImage;
  alt: string;
  title?: string | null;
}) => {
  const rendered = (
    <Image
      src={image.src}
      alt={alt}
      title={title ?? undefined}
      unoptimized
      loading="lazy"
      {...imageSize(image)}
    />
  );

  if (image.href === undefined) return rendered;

  return image.width !== undefined && image.height !== undefined ? (
    <PostImageLightbox
      href={image.href}
      alt={alt}
      width={image.width}
      height={image.height}
    >
      {rendered}
    </PostImageLightbox>
  ) : (
    <a href={image.href}>{rendered}</a>
  );
};

const renderer = (images: PostMarkdownImage[]) => ({
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

  image(this: ReactRenderer, src: string, alt: string, title?: string | null) {
    const image = images.find(({ reference }) => reference === src);

    if (image) {
      return (
        <MarkdownImage
          key={this.elementId}
          image={image}
          alt={alt}
          title={title}
        />
      );
    }

    const name = postImageNameFromReference(src);

    if (name !== undefined) {
      return (
        <span key={this.elementId} className="italic">
          image not found: {name}
        </span>
      );
    }

    const safe = safeUrl(src);

    if (!safe) return <span key={this.elementId}>{alt}</span>;

    return (
      <MarkdownImage
        key={this.elementId}
        image={{ reference: src, src: safe.url }}
        alt={alt}
        title={title}
      />
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
});

const PostMarkdown = ({
  content,
  images = [],
}: {
  content: string;
  images?: PostMarkdownImage[];
}) => (
  <div
    className="prose prose-invert prose-pre:bg-slate-900
      prose-code:before:content-none prose-code:after:content-none max-w-none"
  >
    <Markdown instance={marked} value={content} renderer={renderer(images)} />
  </div>
);

export default PostMarkdown;
