import { pageMetadata } from "@/app/lib/metadata";
import RouteMap from "@/app/projects/adventures/RouteMap";
import ProjectPage from "@/app/projects/ProjectPage";

export const metadata = pageMetadata("adventures");

const Adventures = () => (
  <ProjectPage title="Adventures">
    <div
      className="overflow-clip rounded-2xl bg-slate-900 shadow-xl ring-1
        shadow-slate-950/50 ring-slate-700"
    >
      <RouteMap className="aspect-2/1 w-full" />
    </div>
    <p>Adventures coming soon!</p>
  </ProjectPage>
);

export default Adventures;
