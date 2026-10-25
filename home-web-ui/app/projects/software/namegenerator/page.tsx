import {
  openGraphPage,
  pageMetadata,
  siteShareImages,
} from "@/app/lib/metadata";
import {
  DEFAULT_SETTINGS,
  PREVIEW_SEED,
} from "@/app/projects/software/namegenerator/generatorState";
import LazyNameGenerator from "@/app/projects/software/namegenerator/LazyNameGenerator";
import SampleNames from "@/app/projects/software/namegenerator/SampleNames";
import {
  formatProjectName,
  generateBatch,
} from "@/app/projects/software/namegenerator/words/generateNames";
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

const { mode, style, length, theme, pins, format } = DEFAULT_SETTINGS;

const SAMPLE_NAMES = generateBatch(
  { mode, style, length, theme, pins, keyword: undefined },
  PREVIEW_SEED,
).map((name) => ({
  text: formatProjectName(name, format),
  parts: name.parts,
}));

const NameGeneratorPage = () => (
  <ProjectPage
    title="Name Generator"
    backLink={{ href: "/projects/software", label: "Software" }}
  >
    <p className="text-slate-300">
      Generate names for software projects and usernames from curated word
      lists, themed around nature, space, the workshop, mythology, the kitchen
      and tech. Pick a length and style, start from your own word, pin the words
      you like and star favorites to keep. Everything runs in your browser.
    </p>
    <LazyNameGenerator>
      <SampleNames names={SAMPLE_NAMES} />
    </LazyNameGenerator>
  </ProjectPage>
);

export default NameGeneratorPage;
