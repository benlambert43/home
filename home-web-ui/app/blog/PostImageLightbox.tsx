"use client";

import { InsideLinkContext } from "@/app/blog/PostMarkdownLink";
import Dialog from "@/app/components/Dialog";
import { useHydrated } from "@/app/lib/useHydrated";
import Button from "@/app/ui/Button";
import Image from "next/image";
import { MouseEvent, ReactNode, useContext, useState } from "react";
import { createPortal } from "react-dom";

const opensElsewhere = (event: MouseEvent<HTMLAnchorElement>) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

const PostImageLightbox = ({
  href,
  alt,
  width,
  height,
  children,
}: {
  href: string;
  alt: string;
  width: number;
  height: number;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const mounted = useHydrated();
  const insideLink = useContext(InsideLinkContext);

  const close = () => {
    setOpen(false);
  };

  if (insideLink) return children;

  const lightbox = (
    <Dialog open={open} onClose={close} label={alt === "" ? "Image" : alt}>
      <div className="flex flex-col items-center gap-3">
        {open && (
          <Image
            src={href}
            alt={alt}
            width={width}
            height={height}
            unoptimized
            className="h-auto max-h-[80vh] w-auto max-w-full rounded-md"
          />
        )}
        <Button type="button" size="small" emphasis="secondary" onClick={close}>
          Close
        </Button>
      </div>
    </Dialog>
  );

  return (
    <>
      <a
        href={href}
        onClick={(event) => {
          if (opensElsewhere(event)) return;

          event.preventDefault();
          setOpen(true);
        }}
      >
        {children}
      </a>

      {mounted && createPortal(lightbox, document.body)}
    </>
  );
};

export default PostImageLightbox;
