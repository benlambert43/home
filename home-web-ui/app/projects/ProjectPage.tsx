import PageColumn from "@/app/components/PageColumn";
import ProjectHeading from "@/app/projects/ProjectHeading";
import { ReactNode } from "react";

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
    <ProjectHeading title={title} backLink={!index} />
    {children}
  </PageColumn>
);

export default ProjectPage;
