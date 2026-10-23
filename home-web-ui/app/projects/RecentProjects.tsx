import { PROJECTS } from "@/app/projects/projects";
import Link from "next/link";

const RecentProjects = () => (
  <ul aria-label="Projects" className="grid grid-cols-3 gap-3">
    {PROJECTS.map(({ href, title, preview }) => (
      <li key={href}>
        <Link
          href={href}
          className="flex h-full flex-col overflow-clip rounded-lg
            bg-slate-700/40 ring-1 ring-slate-600 transition hover:bg-slate-700
            hover:ring-slate-400"
        >
          <div
            data-animations-paused
            aria-hidden
            className="relative aspect-video overflow-clip bg-slate-900"
          >
            <div
              className="absolute top-0 left-0 size-[200%] origin-top-left
                scale-50"
            >
              {preview}
            </div>
          </div>
          <span
            className="truncate px-2 py-1.5 text-xs font-semibold sm:text-sm"
          >
            {title}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

export default RecentProjects;
