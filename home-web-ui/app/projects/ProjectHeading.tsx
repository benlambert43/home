import AnimationsPauseButton from "@/app/components/AnimationsPauseButton";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

export type BackLink = { href: string; label: string };

export const PROJECTS_BACK_LINK: BackLink = {
  href: "/projects",
  label: "Projects",
};

const ProjectHeading = ({
  title,
  backLink,
}: {
  title: string;
  backLink?: BackLink;
}) => (
  <div className="flex flex-col items-start gap-3">
    {backLink && (
      <Link
        href={backLink.href}
        className="flex items-center gap-1 text-sm text-slate-400
          hover:text-slate-200 hover:underline"
      >
        <ArrowLeftIcon className="size-4" />
        {backLink.label}
      </Link>
    )}
    <h1 className="text-4xl font-bold">{title}</h1>
    <div className="-ml-1">
      <AnimationsPauseButton />
    </div>
  </div>
);

export default ProjectHeading;
