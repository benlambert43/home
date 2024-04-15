import { Avatar, Divider } from "@mui/material";
import { ParagraphTypography } from "../../common/styledComponents/ParagraphTypography";
import { SubtitleTypography } from "../../common/styledComponents/SubtitleTypography";
import { TitleTypography } from "../../common/styledComponents/TitleTypography";
import profPic from "../../../assets/profile.jpg";

export const HomeHeader = () => {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: "30%" }}>
          <Avatar
            alt="Ben Lambert"
            src={profPic}
            style={{ minWidth: 64, minHeight: 64 }}
          />
        </div>
        <div style={{ maxWidth: "70%", paddingLeft: 15, paddingRight: 30 }}>
          <TitleTypography>benlambert.tech</TitleTypography>
          <SubtitleTypography>
            redirects to benlambert43.github.io/home/
          </SubtitleTypography>
        </div>
      </div>
      <div style={{ paddingTop: "1.5vh", paddingBottom: "1.5vh" }} />
      <Divider />
      <div style={{ paddingTop: "1.5vh", paddingBottom: "1.5vh" }} />

      <TitleTypography>Hi!</TitleTypography>
      <div style={{ paddingTop: "1.5vh", paddingBottom: "1.5vh" }} />
      <ParagraphTypography>
        I am a 22 year old full stack software developer with a focus on web
        technologies and building solutions to complex business problems.
      </ParagraphTypography>
      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <ParagraphTypography>
        I am currently a software developer working at CDW, living in Far Hills
        NJ.
      </ParagraphTypography>

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />
      <ParagraphTypography>
        My mission is to use database, backend, frontend and deployment
        technologies to create cutting-edge software that is reliable,
        performant, and inviting to use.
      </ParagraphTypography>
      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <ParagraphTypography>
        Source code for this website{" "}
        <a
          href="https://github.com/benlambert43/PersonalWebsite"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        .{" "}
      </ParagraphTypography>
    </div>
  );
};
