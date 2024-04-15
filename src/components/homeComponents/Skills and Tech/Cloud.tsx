import { Chip } from "@mui/material";
import { colorTheme } from "../../common/color/colorTheme";
import { ChipTypography } from "../../common/styledComponents/ChipTypography";
import { ParagraphTypography } from "../../common/styledComponents/ParagraphTypography";
import CloudIcon from "@mui/icons-material/CloudOutlined";

export const Cloud = () => {
  const renderChipsLanguages = [
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.intermediate,
        color: colorTheme.blackText,
      }}
      icon={<CloudIcon />}
      label={<ChipTypography>GCP</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.intermediate,
        color: colorTheme.blackText,
      }}
      icon={<CloudIcon />}
      label={<ChipTypography>Azure</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.working,
        color: colorTheme.blackText,
      }}
      icon={<CloudIcon />}
      label={<ChipTypography>AWS</ChipTypography>}
      variant="filled"
    />,
  ];

  return (
    <div>
      <ParagraphTypography>Clouds</ParagraphTypography>
      <div style={{ paddingTop: "1vh", paddingBottom: "1vh" }} />
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {renderChipsLanguages.map((c) => (
          <div style={{ padding: 5, margin: 1 }}>{c}</div>
        ))}
      </div>
    </div>
  );
};
