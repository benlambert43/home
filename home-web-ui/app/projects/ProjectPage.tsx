import { getAnimationsPaused } from "@/app/lib/animationsPaused";
import ProjectAnimations from "@/app/projects/ProjectAnimations";
import { ReactNode } from "react";

const ProjectPage = async ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <ProjectAnimations
    initialPaused={await getAnimationsPaused()}
    title={title}
    backLink
    className="flex max-w-240 flex-col gap-8 p-5"
  >
    {children}
  </ProjectAnimations>
);

export default ProjectPage;
