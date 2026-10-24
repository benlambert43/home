import { pageMetadata } from "@/app/lib/metadata";
import NameGenerator from "@/app/projects/software/namegenerator/NameGenerator";
import ProjectPage from "@/app/projects/ProjectPage";

const DESCRIPTION =
  "Generate memorable names for software projects and usernames, built in your browser from curated word lists.";

export const metadata = pageMetadata("name generator", {
  canonicalPath: "/projects/software/namegenerator",
  description: DESCRIPTION,
});

const NameGeneratorPage = () => (
  <ProjectPage
    title="Name Generator"
    backLink={{ href: "/projects/software", label: "Software" }}
  >
    <NameGenerator />
  </ProjectPage>
);

export default NameGeneratorPage;
