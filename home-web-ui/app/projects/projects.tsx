import RouteMap from "@/app/projects/adventures/RouteMap";
import BirdWire from "@/app/projects/lifelist/BirdWire";
import Terminal from "@/app/projects/software/Terminal";
import { ReactNode } from "react";

export type Project = { href: string; title: string; preview: ReactNode };

export const PROJECTS: Project[] = [
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
