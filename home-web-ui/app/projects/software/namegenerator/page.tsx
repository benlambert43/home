import {
  openGraphPage,
  pageMetadata,
  siteShareImages,
} from "@/app/lib/metadata";
import { DEFAULT_SETTINGS } from "@/app/projects/software/namegenerator/generatorState";
import LazyNameGenerator from "@/app/projects/software/namegenerator/LazyNameGenerator";
import SampleNames from "@/app/projects/software/namegenerator/SampleNames";
import { formatProjectName } from "@/app/projects/software/namegenerator/words/generateNames";
import ProjectPage from "@/app/projects/ProjectPage";
import type { Metadata, ResolvingMetadata } from "next";

const PATH = "/projects/software/namegenerator";

const TITLE = "name generator";

const DESCRIPTION =
  "Generate memorable names for software projects and usernames, built in your browser from curated word lists.";

export const generateMetadata = async (
  _props: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> => ({
  ...pageMetadata(TITLE, { canonicalPath: PATH, description: DESCRIPTION }),
  openGraph: {
    type: "website",
    ...openGraphPage(TITLE, DESCRIPTION, PATH),
    images: await siteShareImages(parent),
  },
});

const SAMPLE_PARTS: string[][] = [
  ["quill", "tap"],
  ["relic", "desk"],
  ["rose", "sailfish"],
  ["lilac", "wave"],
  ["aqua", "mesh", "web"],
  ["regal", "dry", "gold"],
  ["granite", "bit", "cast"],
  ["kelpara"],
  ["rainspen"],
  ["tarnix"],
  ["maple", "cloud"],
  ["sage", "percivalex"],
];

const SAMPLE_NAMES = SAMPLE_PARTS.map((parts) => ({
  text: formatProjectName({ parts }, DEFAULT_SETTINGS.format),
  parts,
}));

const NameGeneratorPage = () => (
  <ProjectPage
    title="Name Generator"
    backLink={{ href: "/projects/software", label: "Software" }}
  >
    <p className="text-slate-300">
      Generate names for software projects and usernames, using word lists and
      themes to choose your favorites and iterate on the words that speak to
      you. The project name and username generator runs in the browser.
    </p>
    <LazyNameGenerator>
      <SampleNames names={SAMPLE_NAMES} />
    </LazyNameGenerator>
  </ProjectPage>
);

export default NameGeneratorPage;
