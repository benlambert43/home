import { GITHUB_REPOSITORY_URL } from "@/app/about/links";
import RecentPosts from "@/app/blog/RecentPosts";
import Content from "@/app/components/Content";
import Hero from "@/app/components/Hero";
import WebSiteJsonLd from "@/app/components/WebSiteJsonLd";
import { homeMetadata } from "@/app/lib/metadata";
import { ReactNode } from "react";

export const metadata = homeMetadata;

const HIGHLIGHTS: { emoji: string; description: ReactNode }[] = [
  {
    emoji: "👋",
    description: "Welcome!",
  },
  {
    emoji: "⌨️",
    description: (
      <>
        The source code for this website is available{" "}
        <a
          target="_blank"
          href={GITHUB_REPOSITORY_URL}
          rel="noopener noreferrer"
          className="underline"
        >
          here
        </a>
        .
      </>
    ),
  },
];

const Highlights = () => (
  <ul className="flex flex-col gap-4">
    {HIGHLIGHTS.map(({ emoji, description }) => (
      <li key={emoji}>
        <p className="text-2xl">{emoji}</p>
        <p>{description}</p>
      </li>
    ))}
  </ul>
);

const Home = () => (
  <div>
    <WebSiteJsonLd />
    <Hero />
    <Content>
      <RecentPosts />
      <div className="flex">
        <div className="max-w-80">
          <Highlights />
        </div>
      </div>
    </Content>
  </div>
);

export default Home;
