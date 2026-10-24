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

const returnPath = (params: Awaited<SearchParams>) => {
  const query = new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) =>
      typeof value === "string" ? [[key, value]] : [],
    ),
  ).toString();
  return query === "" ? PATH : `${PATH}?${query}`;
};

const NameGeneratorPage = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const params = await searchParams;
  await requireBffSessionUser(returnPath(params));
  const initial = parseGeneratorState(params, randomSeed());

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
