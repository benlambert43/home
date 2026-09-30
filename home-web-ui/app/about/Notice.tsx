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
  <div className="flex max-w-160 flex-col gap-4 p-5">
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
    <div
      className="prose prose-invert prose-code:before:content-none
        prose-code:after:content-none max-w-none"
    >
      {children}
    </div>
  </div>
);

export default Notice;
