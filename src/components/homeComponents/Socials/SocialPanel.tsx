import { Avatar } from "@mui/material";
import { TitleTypography } from "../../common/styledComponents/TitleTypography";
import TwitterIcon from "@mui/icons-material/Twitter";
import { ParagraphTypography } from "../../common/styledComponents/ParagraphTypography";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export const SocialPanel = () => {
  return (
    <div>
      <div>
        <TitleTypography>Socials </TitleTypography>
      </div>

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />
      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Avatar
          sx={{ bgcolor: "#E1306C" }}
          component="a"
          href="https://www.instagram.com/ben_lmbrt/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon />
        </Avatar>
        <div style={{ padding: 5 }} />
        <ParagraphTypography>@ben_lmbrt</ParagraphTypography>
      </div>
      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Avatar
          sx={{ bgcolor: "#0e76a8" }}
          component="a"
          href="https://www.linkedin.com/in/benlambert43"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedInIcon />
        </Avatar>
        <div style={{ padding: 5 }} />
        <ParagraphTypography>@benlambert43</ParagraphTypography>
      </div>
      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />
    </div>
  );
};
