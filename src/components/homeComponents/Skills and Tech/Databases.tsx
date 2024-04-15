import { Chip } from "@mui/material";
import { colorTheme } from "../../common/color/colorTheme";
import { ChipTypography } from "../../common/styledComponents/ChipTypography";
import { ParagraphTypography } from "../../common/styledComponents/ParagraphTypography";
import StorageIcon from '@mui/icons-material/Storage';

export const Databases = () => {
  const renderChipsLanguages = [
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.highest,
        color: colorTheme.blackText,
      }}
      icon={<StorageIcon />}
      label={<ChipTypography>MongoDB</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.highest,
        color: colorTheme.blackText,
      }}
      icon={<StorageIcon />}
      label={<ChipTypography>MySQL / MariaDB</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.intermediate,
        color: colorTheme.blackText,
      }}
      icon={<StorageIcon />}
      label={<ChipTypography>Postgres</ChipTypography>}
      variant="filled"
    />,
    <Chip
      style={{
        padding: 5,
        backgroundColor: colorTheme.working,
        color: colorTheme.blackText,
      }}
      icon={<StorageIcon />}
      label={<ChipTypography>Redis</ChipTypography>}
      variant="filled"
    />,
  ];

  return (
    <div>
      <ParagraphTypography>Databases</ParagraphTypography>
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
