"use client";

import { createContext, ReactNode } from "react";

export const InsideLinkContext = createContext(false);

const PostMarkdownLink = ({
  href,
  external,
  children,
}: {
  href: string;
  external: boolean;
  children: ReactNode;
}) => (
  <InsideLinkContext.Provider value={true}>
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
    >
      {children}
    </a>
  </InsideLinkContext.Provider>
);

export default PostMarkdownLink;
