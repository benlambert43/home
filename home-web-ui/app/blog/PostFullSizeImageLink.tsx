import { ReactNode } from "react";

const PostFullSizeImageLink = ({
  href,
  alt,
  children,
}: {
  href: string;
  alt: string;
  children: ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener"
    aria-label={
      alt === "" ? "Open full size image" : `Open full size image: ${alt}`
    }
  >
    {children}
  </a>
);

export default PostFullSizeImageLink;
