import { pageMetadata } from "@/app/lib/metadata";
import RouteMap from "@/app/projects/adventures/RouteMap";
import BirdWire from "@/app/projects/lifelist/BirdWire";
import ProjectPage from "@/app/projects/ProjectPage";
import Terminal from "@/app/projects/software/Terminal";
import { ArrowRightIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { CSSProperties, ReactNode } from "react";

export const metadata = pageMetadata("projects");

const SECTIONS: { href: string; title: string; preview: ReactNode }[] = [
  {
    href: "/projects/software",
    title: "Software",
    preview: (
      <div className="absolute inset-x-4 top-4">
        <Terminal />
      </div>
    ),
  },
  {
    href: "/projects/lifelist",
    title: "Life List",
    preview: <BirdWire className="size-full" />,
  },
  {
    href: "/projects/adventures",
    title: "Adventures",
    preview: <RouteMap className="size-full" />,
  },
];

const Projects = () => (
  <ProjectPage title="Projects" index>
    <ul className="grid gap-5 md:grid-cols-3">
      {SECTIONS.map(({ href, title, preview }, order) => (
        <li
          key={href}
          className="animated:motion-safe:animate-rise"
          style={{ "--rise-order": order } as CSSProperties}
        >
          <Link
            href={href}
            className="group animated:motion-safe:hover:-translate-y-1
              animated:motion-safe:hover:shadow-xl
              animated:motion-safe:hover:shadow-slate-950/40 flex h-full
              flex-col overflow-clip rounded-2xl bg-slate-700/40 ring-1
              ring-slate-600 transition duration-300 ease-out
              hover:ring-slate-400"
          >
            <div className="relative aspect-video overflow-clip bg-slate-900">
              {preview}
            </div>
            <div className="p-5">
              <h2 className="flex items-center gap-2 text-2xl font-semibold">
                {title}
                <ArrowRightIcon
                  className="animated:motion-safe:group-hover:translate-x-1
                    size-5 text-slate-400 transition-transform duration-300
                    ease-out group-hover:text-slate-50"
                />
              </h2>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  </ProjectPage>
);

export default Projects;
