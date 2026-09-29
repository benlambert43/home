import { pageMetadata } from "@/app/lib/metadata";
import ProjectPage from "@/app/projects/ProjectPage";
import SoftwareWindows from "@/app/projects/software/SoftwareWindows";
import Terminal from "@/app/projects/software/Terminal";

export const metadata = pageMetadata("software");

const Software = () => (
  <ProjectPage title="Software">
    <Terminal />
    <SoftwareWindows />
  </ProjectPage>
);

export default Software;
