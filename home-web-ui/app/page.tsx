import Content from "./components/Content";
import Hero from "./components/Hero";
import LeftContent from "./components/LeftContent";
import RightContent from "./components/RightContent";

const Home = () => {
  return (
    <div>
      <Hero />
      <Content>
        <LeftContent />
        <RightContent />
      </Content>
    </div>
  );
};

export default Home;
