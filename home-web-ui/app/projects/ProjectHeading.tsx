import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { ReactNode } from "react";

const ProjectHeading = ({
  title,
  backLink,
  animated = false,
  children,
}: {
  title: string;
  backLink: boolean;
  animated?: boolean;
  children: ReactNode;
}) => (
  <div
    data-animated={animated || undefined}
    className="flex flex-col items-start gap-3"
  >
    {backLink && (
      <Link
        href="/projects"
        className="flex items-center gap-1 text-sm text-slate-400
          hover:text-slate-200 hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        Projects
      </Link>
    )}
    <h1 className="text-4xl font-bold">{title}</h1>
    <div className="-ml-1">{children}</div>
  </div>
);

export default ProjectHeading;
