import { NO_WARRANTY_HREF, TERMS_OF_USE } from "@/app/about/notices";
import PageColumn from "@/app/components/PageColumn";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { ReactNode } from "react";

const formatUpdated = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  });

const Notice = ({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) => (
  <PageColumn className="flex flex-col gap-4">
    <Link
      href="/about"
      className="flex items-center gap-1 self-start text-sm text-slate-400
        hover:text-slate-200 hover:underline"
    >
      <ArrowLeftIcon className="size-4" />
      About
    </Link>
    <h1 className="text-4xl font-bold">{title}</h1>
    <p className="text-sm text-slate-400">
      Last updated <time dateTime={updated}>{formatUpdated(updated)}</time>
    </p>
    <p className="rounded-xl bg-slate-700/40 p-4 text-sm text-slate-300">
      I build and run this site on my own, as an individual and not a company.
      This page describes how the site is meant to work and is kept accurate on
      a best-effort basis, but software has bugs, and the site may not always
      behave exactly as described. The{" "}
      <Link href={NO_WARRANTY_HREF} className="underline">
        {TERMS_OF_USE.title}
      </Link>{" "}
      explain what that means for you. First-person pronouns on these pages (I,
      me, my) refer to me, Ben Lambert.
    </p>
    <div
      className="prose prose-invert prose-code:before:content-none
        prose-code:after:content-none max-w-none"
    >
      {children}
    </div>
  </PageColumn>
);

export default Notice;
