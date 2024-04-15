import { HomeHeader } from "./Hi/HomeHeader";
import { Cloud } from "./Skills and Tech/Cloud";
import { Databases } from "./Skills and Tech/Databases";
import { Deployments } from "./Skills and Tech/Deployments";
import { FrameworksRuntimeEnv } from "./Skills and Tech/FrameworksRuntimeEnv";
import { ProgrammingLangs } from "./Skills and Tech/ProgrammingLangs";
import { SkillsLegend } from "./Skills and Tech/SkillsLegend";
import { SocialPanel } from "./Socials/SocialPanel";

export const PageContent = () => {
  return (
    <div
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: "10%",
      }}
    >
      <HomeHeader />

      <div style={{ paddingTop: "3vh", paddingBottom: "3vh" }} />

      <SocialPanel />

      <div style={{ paddingTop: "3vh", paddingBottom: "3vh" }} />

      <SkillsLegend />

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <ProgrammingLangs />

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <FrameworksRuntimeEnv />

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <Databases />

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <Cloud />

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <Deployments />

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />
    </div>
  );
};
