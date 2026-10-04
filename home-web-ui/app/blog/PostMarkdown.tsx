import PostFullSizeImageLink from "@/app/blog/PostFullSizeImageLink";
import { POST_IMAGE_SIZES } from "@/app/blog/postImageSizes";
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

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const HEADING_TAGS: Record<HeadingLevel, "h2" | "h3" | "h4" | "h5" | "h6"> = {
  1: "h2",
  2: "h3",
  3: "h4",
  4: "h5",
  5: "h6",
  6: "h6",
};

const headingsRendered = new WeakMap<ReactRenderer, number>();

export type PostMarkdownImage = {
  reference: string;
  src: string;
  fullSizeHref?: string;
  width: number;
  height: number;
};

const renderer = (images: PostMarkdownImage[], headingIds: string[]) => ({
  heading(this: ReactRenderer, children: ReactNode, level: HeadingLevel) {
    const position = headingsRendered.get(this) ?? 0;
    const Heading = HEADING_TAGS[level];

    headingsRendered.set(this, position + 1);

    return (
      <Heading
        key={this.elementId}
        id={headingIds.at(position)}
        className="scroll-mt-32 sm:scroll-mt-24"
      >
        {children}
      </Heading>
    );
  },

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

    const rendered = (
      <Image
        key={this.elementId}
        src={image.src}
        alt={alt}
        title={title ?? undefined}
        width={image.width}
        height={image.height}
        sizes={POST_IMAGE_SIZES}
      />
    );

    if (image.fullSizeHref === undefined) return rendered;

    return (
      <PostFullSizeImageLink
        key={this.elementId}
        href={image.fullSizeHref}
        alt={alt}
      >
        {rendered}
      </PostFullSizeImageLink>
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
  headingIds = [],
}: {
  content: string;
  images?: PostMarkdownImage[];
  headingIds?: string[];
}) => (
  <div
    className="prose prose-invert prose-pre:bg-slate-900
      prose-code:before:content-none prose-code:after:content-none max-w-none"
  >
    <Markdown value={content} renderer={renderer(images, headingIds)} />
  </div>
);

export default PostMarkdown;
