import PageColumn from "@/app/components/PageColumn";
import ProjectHeading, {
  BackLink,
  PROJECTS_BACK_LINK,
} from "@/app/projects/ProjectHeading";
import { ReactNode } from "react";

const ProjectPage = ({
  title,
  index = false,
  backLink = PROJECTS_BACK_LINK,
  children,
}: {
  title: string;
  index?: boolean;
  backLink?: BackLink;
  children: ReactNode;
}) => (
  <PageColumn className={`flex flex-col ${index ? "gap-6" : "gap-8"}`}>
    <ProjectHeading title={title} backLink={index ? undefined : backLink} />
    {children}
  </PageColumn>
);

export default ProjectPage;
