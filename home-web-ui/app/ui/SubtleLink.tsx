import GuardedLink from "@/app/components/GuardedLink";
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
  external = false,
}: {
  href: string;
  children: ReactNode;
  textSize?: SubtleLinkTextSize;
  external?: boolean;
}) => (
  <GuardedLink
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    className={`${TEXT_SIZE_CLASSES[textSize]} text-slate-400 underline
      decoration-transparent decoration-1 underline-offset-4 transition-colors
      duration-200 ease-out hover:text-slate-200 hover:decoration-slate-200/50
      focus-visible:text-slate-200 focus-visible:decoration-slate-200/50`}
  >
    {children}
  </GuardedLink>
);

export default SubtleLink;
