import PostImageLightbox from "@/app/blog/PostImageLightbox";
import { isExternalPostLink, postImageNameFromReference } from "@home/shared";
import Markdown, { ReactRenderer } from "marked-react";
import Image from "next/image";
import { ReactNode } from "react";

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
  width: number;
  height: number;
};

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
      width={image.width}
      height={image.height}
      unoptimized
      loading="lazy"
    />
  );

  if (image.href === undefined) return rendered;

  return (
    <PostImageLightbox
      href={image.href}
      alt={alt}
      width={image.width}
      height={image.height}
    >
      {rendered}
    </PostImageLightbox>
  );
};

const renderer = (images: PostMarkdownImage[]) => ({
  link(this: ReactRenderer, href: string, text: ReactNode) {
    const external = isExternalPostLink(href);

    return (
      <a
        key={this.elementId}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer noopener" : undefined}
      >
        {text}
      </a>
    );
  },

  image(this: ReactRenderer, src: string, alt: string, title?: string | null) {
    const image = images.find(({ reference }) => reference === src);

    if (!image) {
      return (
        <span key={this.elementId} className="italic">
          image not found: {postImageNameFromReference(src) ?? src}
        </span>
      );
    }

    return (
      <MarkdownImage
        key={this.elementId}
        image={image}
        alt={alt}
        title={title}
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
    <Markdown value={content} renderer={renderer(images)} />
  </div>
);

export default PostMarkdown;
