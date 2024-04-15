import { Chip } from "@mui/material";
import { colorTheme } from "../../common/color/colorTheme";
import { ChipTypography } from "../../common/styledComponents/ChipTypography";
import { ParagraphTypography } from "../../common/styledComponents/ParagraphTypography";
import ComputerIcon from "@mui/icons-material/ComputerOutlined";
import CloudIcon from "@mui/icons-material/CloudCircleOutlined";
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import MergeTypeIcon from '@mui/icons-material/MergeType';

export const Deployments = () => {
  const renderChipsLanguages = [
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.highest,
        color: colorTheme.blackText,
      }}
      icon={<ComputerIcon />}
      label={<ChipTypography>On-Prem Virtual Machine</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.highest,
        color: colorTheme.blackText,
      }}
      icon={<DirectionsBoatIcon />}
      label={<ChipTypography>Docker Containers</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.intermediate,
        color: colorTheme.blackText,
      }}
      icon={<CloudIcon />}
      label={<ChipTypography>Cloud Deployment Tools</ChipTypography>}
      variant="filled"
    />,
    <Chip
    style={{
      padding: 5,
      backgroundColor: colorTheme.working,
      color: colorTheme.blackText,
    }}
    icon={<MergeTypeIcon />}
    label={<ChipTypography>Hybrid Cloud/On-Prem Deployments</ChipTypography>}
    variant="filled"
  />,
  ];

  return (
    <div>
      <ParagraphTypography>Deployment Technologies</ParagraphTypography>
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
