import { Chip } from "@mui/material";
import { colorTheme } from "../../common/color/colorTheme";
import { ChipTypography } from "../../common/styledComponents/ChipTypography";
import { ParagraphTypography } from "../../common/styledComponents/ParagraphTypography";
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';

export const FrameworksRuntimeEnv = () => {
  const renderChipsLanguages = [
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.highest,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>NodeJS</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.highest,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>React</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.highest,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>React Native</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.intermediate,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>ElectronJS</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.intermediate,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>NX</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.intermediate,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>Pipenv</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.working,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>ThreeJS</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.working,
        color: colorTheme.blackText,
      }}
      icon={<DeveloperBoardIcon />}
      label={<ChipTypography>JavaFX</ChipTypography>}
      variant="filled"
    />,
  ];

  return (
    <div>
      <ParagraphTypography>
        Frameworks and Runtime Environments
      </ParagraphTypography>
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
