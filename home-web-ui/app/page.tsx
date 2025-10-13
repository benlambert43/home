import Content from "./components/Content";
import Hero from "./components/Hero";
import LeftContent from "./components/LeftContent";
import RightContent from "./components/RightContent";

const RightContentList = () => {
  const items: {
    id: number;
    title: string | React.ReactNode;
    description: string | React.ReactNode;
  }[] = [
    {
      id: 1,
      title: "👋",
      description: <div>Welcome!</div>,
    },
    {
      id: 2,
      title: "🔗📜",
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
  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.id}>
          <h2 className="text-2xl">{item.title}</h2>
          <div>{item.description}</div>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  return (
    <div>
      <Hero />
      <Content>
        <LeftContent>
          <p>Left content</p>
        </LeftContent>
        <RightContent>
          <div className="max-w-80">
            <RightContentList />
          </div>
        </RightContent>
      </Content>
    </div>
  );
};

export default Home;
