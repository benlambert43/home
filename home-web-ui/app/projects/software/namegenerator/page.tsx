import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import { pageMetadata } from "@/app/lib/metadata";
import { SearchParams } from "@/app/lib/searchParams";
import { parseGeneratorState } from "@/app/projects/software/namegenerator/generatorState";
import NameGenerator from "@/app/projects/software/namegenerator/NameGenerator";
import { randomSeed } from "@/app/projects/software/namegenerator/words/random";
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

const NameGeneratorPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  await requireBffSessionUser(PATH);
  const initial = parseGeneratorState(await searchParams, randomSeed());

  return (
    <ProjectPage
      title="Name Generator"
      backLink={{ href: "/projects/software", label: "Software" }}
    >
      <NameGenerator initial={initial} />
    </ProjectPage>
  );
};

export default NameGeneratorPage;
