import AnimationsPauseButton from "@/app/components/AnimationsPauseButton";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

const ProjectHeading = ({
  title,
  backLink,
}: {
  title: string;
  backLink: boolean;
}) => (
  <div className="flex flex-col items-start gap-3">
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
    <div className="-ml-1">
      <AnimationsPauseButton />
    </div>
  </div>
);

export default ProjectHeading;
