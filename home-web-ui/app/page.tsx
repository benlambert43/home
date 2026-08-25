import Content from "@/app/components/Content";
import Hero from "@/app/components/Hero";
import { ReactNode } from "react";

const HIGHLIGHTS: { title: string; description: ReactNode }[] = [
  {
    title: "👋",
    description: <div>Welcome!</div>,
  },
  {
    title: "⌨️",
    description: (
      <div>
        The source code for this website is available{" "}
        <a
          target="_blank"
          href="https://github.com/benlambert43/home"
          rel="noopener noreferrer"
        >
          <u>here</u>
        </a>
        .
      </div>
    ),
  },
];

const Highlights = () => (
  <div className="flex flex-col gap-4">
    {HIGHLIGHTS.map((item) => (
      <div key={item.title}>
        <h2 className="text-2xl">{item.title}</h2>
        <div>{item.description}</div>
      </div>
    ))}
  </div>
);

const Home = () => (
  <div>
    <Hero />
    <Content>
      <div className="flex">
        <p>Left content</p>
      </div>
      <div className="flex">
        <div className="max-w-80">
          <Highlights />
        </div>
      </div>
    </Content>
  </div>
);

export default Home;
