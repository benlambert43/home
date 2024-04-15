import { colorTheme } from "../../common/color/colorTheme";
import { ParagraphTypographySmall } from "../../common/styledComponents/ParagraphTypographySmall";
import { TitleTypography } from "../../common/styledComponents/TitleTypography";

export const SkillsLegend = () => {
  return (
    <div>
      <div>
        <TitleTypography>Skills and Technologies </TitleTypography>
      </div>

      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />

      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <div
          style={{
            minHeight: 20,
            minWidth: 20,
            backgroundColor: colorTheme.highest,
            margin: 5,
          }}
        />
        <ParagraphTypographySmall>
          Highest level of knowledge
        </ParagraphTypographySmall>
      </div>

      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <div
          style={{
            minHeight: 20,
            minWidth: 20,
            backgroundColor: colorTheme.intermediate,
            margin: 5,
          }}
        />
        <ParagraphTypographySmall>
          Intermediate level of knowledge
        </ParagraphTypographySmall>
      </div>

      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <div
          style={{
            minHeight: 20,
            minWidth: 20,
            backgroundColor: colorTheme.working,
            margin: 5,
          }}
        />
        <ParagraphTypographySmall>Working knowledge</ParagraphTypographySmall>
      </div>
    </div>
  );
};
