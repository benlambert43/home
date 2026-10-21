"use client";

import { useNavigationGuard } from "@/app/components/NavigationGuardProvider";
import Link from "next/link";
import { ComponentProps } from "react";

export type GuardedLinkProps = Omit<
  ComponentProps<typeof Link>,
  "href" | "replace" | "scroll" | "transitionTypes"
> & { href: string };

const GuardedLink = ({ href, onNavigate, ...props }: GuardedLinkProps) => {
  const { confirmNavigation } = useNavigationGuard();

  return (
    <Link
      {...props}
      href={href}
      onNavigate={(event) => {
        if (confirmNavigation(href)) {
          onNavigate?.(event);
          return;
        }

        event.preventDefault();
      }}
    />
  );
};

export default GuardedLink;
