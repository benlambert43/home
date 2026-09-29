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
  <div
    className={
      index
        ? "flex max-w-280 flex-col gap-6 p-5"
        : "flex max-w-240 flex-col gap-8 p-5"
    }
  >
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
  </div>
);

export default ProjectPage;
