import Link, { type LinkProps } from "next/link";
import { ReactNode } from "react";

type SubtleLinkTextSize = "xs" | "base";

const TEXT_SIZE_CLASSES: Record<SubtleLinkTextSize, string> = {
  xs: "text-xs",
  base: "text-base",
};

const SubtleLink = ({
  href,
  children,
  textSize = "xs",
}: {
  href: LinkProps["href"];
  children: ReactNode;
  textSize?: SubtleLinkTextSize;
}) => (
  <Link
    href={href}
    className={`${TEXT_SIZE_CLASSES[textSize]} text-slate-400 underline
      decoration-transparent decoration-1 underline-offset-4 transition-colors
      duration-200 ease-out hover:text-slate-200 hover:decoration-slate-200/50
      focus-visible:text-slate-200 focus-visible:decoration-slate-200/50`}
  >
    {children}
  </Link>
);

export default SubtleLink;
