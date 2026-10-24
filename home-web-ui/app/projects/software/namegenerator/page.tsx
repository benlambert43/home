import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import { pageMetadata } from "@/app/lib/metadata";
import NameGenerator from "@/app/projects/software/namegenerator/NameGenerator";
import ProjectPage from "@/app/projects/ProjectPage";

const PATH = "/projects/software/namegenerator";

const DESCRIPTION =
  "Generate memorable names for software projects and usernames, built in your browser from curated word lists.";

export const metadata = {
  ...pageMetadata("name generator", {
    canonicalPath: PATH,
    description: DESCRIPTION,
  }),
  robots: { index: false },
};

export const instant = false;

const NameGeneratorPage = async () => {
  await requireBffSessionUser(PATH);

  return (
    <ProjectPage
      title="Name Generator"
      backLink={{ href: "/projects/software", label: "Software" }}
    >
      <NameGenerator />
    </ProjectPage>
  );
};

export default NameGeneratorPage;
