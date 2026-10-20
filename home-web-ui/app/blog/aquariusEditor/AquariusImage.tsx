"use client";

import { PostImage } from "@/app/blog/aquariusEditor/postMarkdown";
import { PostFormImage } from "@/app/blog/postForm/postFormImages";
import { postImageSizing } from "@/app/blog/postImageSizes";
import { postImageNameFromReference, postImageReference } from "@home/shared";
import {
  NodeViewWrapper,
  ReactNodeViewProps,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import Image from "next/image";
import { createContext, useContext } from "react";

export type EditorImages = {
  images: PostFormImage[];
  editImage: (position: number, alt: string) => void;
};

export const EditorImagesContext = createContext<EditorImages>({
  images: [],
  editImage: () => undefined,
});

export const imageAlt = (attrs: Record<string, unknown>) =>
  typeof attrs.alt === "string" ? attrs.alt : "";

const AquariusImageView = ({ node, getPos }: ReactNodeViewProps) => {
  const { images, editImage } = useContext(EditorImagesContext);
  const source: unknown = node.attrs.src;
  const reference = typeof source === "string" ? source : "";
  const alt = imageAlt(node.attrs);
  const image = images.find(
    (candidate) => postImageReference(candidate.name) === reference,
  );

  return (
    <NodeViewWrapper
      as="span"
      data-drag-handle
      className="block cursor-default"
      onDoubleClick={() => {
        const position = getPos();
        if (position !== undefined) editImage(position, alt);
      }}
    >
      {image ? (
        <Image
          src={image.src}
          alt={alt}
          width={image.width}
          height={image.height}
          draggable={false}
          {...postImageSizing(image)}
        />
      ) : (
        <span className="italic">
          image not found: {postImageNameFromReference(reference) ?? reference}
        </span>
      )}
    </NodeViewWrapper>
  );
};

export const AquariusImage = PostImage.extend({
  addNodeView() {
    return ReactNodeViewRenderer(AquariusImageView, {
      as: "span",
      className: "my-4 block",
    });
  },
});
