import { pageMetadata } from "@/app/lib/metadata";
import BirdWire from "@/app/projects/lifelist/BirdWire";
import ProjectPage from "@/app/projects/ProjectPage";

export const metadata = pageMetadata("life list", {
  canonicalPath: "/projects/lifelist",
});

const LifeList = () => (
  <ProjectPage title="Life List">
    <div
      className="aspect-2/1 overflow-clip rounded-2xl bg-slate-900 shadow-xl
        ring-1 shadow-slate-950/50 ring-slate-700 sm:aspect-3/1 lg:aspect-4/1"
    >
      <BirdWire className="size-full" />
    </div>
    <p>Birds landing soon!</p>
  </ProjectPage>
);

export default LifeList;
