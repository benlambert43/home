import PageColumn from "@/app/components/PageColumn";
import { getAnimationsPaused } from "@/app/lib/animationsPaused";
import AnimationsControl from "@/app/projects/AnimationsControl";
import ProjectHeading from "@/app/projects/ProjectHeading";
import { ReactNode, Suspense } from "react";

const PausedAnimationsControl = async ({
  title,
  backLink,
}: {
  title: string;
  backLink: boolean;
}) => (
  <AnimationsControl
    initialPaused={await getAnimationsPaused()}
    title={title}
    backLink={backLink}
  />
);

const ProjectPage = ({
  title,
  index = false,
  children,
}: {
  title: string;
  index?: boolean;
  children: ReactNode;
}) => (
  <PageColumn className={`flex flex-col ${index ? "gap-6" : "gap-8"}`}>
    <Suspense
      fallback={
        <ProjectHeading title={title} backLink={!index} animated>
          <div className="size-6" />
        </ProjectHeading>
      }
    >
      <PausedAnimationsControl title={title} backLink={!index} />
    </Suspense>
    {children}
  </PageColumn>
);

export default ProjectPage;
