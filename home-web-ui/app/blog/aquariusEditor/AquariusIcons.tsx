import { ReactNode } from "react";

const Pixels = ({
  rows,
  x = 0,
  y = 0,
  fill = "#000",
}: {
  rows: string[];
  x?: number;
  y?: number;
  fill?: string;
}) => (
  <path
    fill={fill}
    d={rows
      .flatMap((row, rowIndex) =>
        [...row].flatMap((cell, column) =>
          cell === "#" ? [`M${x + column} ${y + rowIndex}h1v1h-1z`] : [],
        ),
      )
      .join("")}
  />
);

const Icon = ({
  children,
  size = 16,
  width = size,
  height = size,
}: {
  children: ReactNode;
  size?: number;
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    shapeRendering="crispEdges"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

const UNDO_ARROW = ["...#", "..##", ".###", "####", ".###", "..##", "...#"];

const UndoShape = () => (
  <>
    <path
      d="M5 5H10A4 4 0 0 1 10 13H6"
      fill="none"
      stroke="#1b43b8"
      strokeWidth="2"
      shapeRendering="auto"
    />
    <Pixels rows={UNDO_ARROW} x={1} y={2} fill="#1b43b8" />
  </>
);

export const PostIcon = () => (
  <Icon>
    <path
      d="M1.5 7.5L14.5 1.5L10 14.5L7 9.5Z"
      fill="#fff"
      stroke="#000"
      shapeRendering="auto"
    />
    <path d="M7 9.5L14.5 1.5" stroke="#000" shapeRendering="auto" />
    <path d="M7 9.5L10 14.5L9.5 10.5Z" fill="#808080" shapeRendering="auto" />
  </Icon>
);

export const CutIcon = () => (
  <Icon>
    <circle
      cx="5"
      cy="12.5"
      r="2"
      fill="none"
      stroke="#000"
      shapeRendering="auto"
    />
    <circle
      cx="11"
      cy="12.5"
      r="2"
      fill="none"
      stroke="#000"
      shapeRendering="auto"
    />
    <path
      d="M6.5 10.5L11 2M9.5 10.5L5 2"
      stroke="#000"
      strokeWidth="1.5"
      shapeRendering="auto"
    />
  </Icon>
);

export const CopyIcon = () => (
  <Icon>
    <rect x="2.5" y="1.5" width="8" height="10" fill="#fff" stroke="#000" />
    <rect x="4" y="3" width="5" height="1" fill="#000" />
    <rect x="4" y="5" width="5" height="1" fill="#000" />
    <rect x="6.5" y="4.5" width="8" height="10" fill="#fff" stroke="#000" />
    <rect x="8" y="7" width="5" height="1" fill="#000" />
    <rect x="8" y="9" width="5" height="1" fill="#000" />
    <rect x="8" y="11" width="5" height="1" fill="#000" />
  </Icon>
);

export const PasteIcon = () => (
  <Icon>
    <rect x="2.5" y="2.5" width="10" height="12" fill="#a0522d" stroke="#000" />
    <rect x="5.5" y="1.5" width="4" height="2" fill="#c0c0c0" stroke="#000" />
    <rect x="6.5" y="6.5" width="8" height="8" fill="#fff" stroke="#000" />
    <rect x="8" y="9" width="5" height="1" fill="#000" />
    <rect x="8" y="11" width="5" height="1" fill="#000" />
  </Icon>
);

export const UndoIcon = () => (
  <Icon>
    <UndoShape />
  </Icon>
);

export const RedoIcon = () => (
  <Icon>
    <g transform="translate(16 0) scale(-1 1)">
      <UndoShape />
    </g>
  </Icon>
);

export const LinkIcon = () => (
  <Icon>
    <circle
      cx="7"
      cy="7"
      r="5.5"
      fill="#fff"
      stroke="#000"
      shapeRendering="auto"
    />
    <ellipse
      cx="7"
      cy="7"
      rx="2.5"
      ry="5.5"
      fill="none"
      stroke="#000"
      shapeRendering="auto"
    />
    <path d="M1.5 7H12.5" stroke="#000" />
    <rect
      x="8.5"
      y="10.5"
      width="6"
      height="3"
      rx="1.5"
      fill="#fff"
      stroke="#000"
      shapeRendering="auto"
    />
    <rect
      x="10.5"
      y="12.5"
      width="5"
      height="3"
      rx="1.5"
      fill="#fff"
      stroke="#000"
      shapeRendering="auto"
    />
  </Icon>
);

export const TableIcon = () => (
  <Icon>
    <rect x="1.5" y="2.5" width="13" height="11" fill="#fff" stroke="#000" />
    <rect x="2" y="3" width="12" height="3" fill="#000080" />
    <rect x="5" y="3" width="1" height="10" fill="#000" />
    <rect x="10" y="3" width="1" height="10" fill="#000" />
    <rect x="2" y="9" width="12" height="1" fill="#000" />
  </Icon>
);

export const ImageIcon = () => (
  <Icon>
    <rect x="1.5" y="2.5" width="13" height="11" fill="#9fd3ff" stroke="#000" />
    <circle cx="5" cy="6" r="1.5" fill="#ffd700" shapeRendering="auto" />
    <path d="M2 13L6 8L9 11L11 9L14 13Z" fill="#2e8b3e" shapeRendering="auto" />
  </Icon>
);

export const HorizontalLineIcon = () => (
  <Icon>
    <rect x="2.5" y="1.5" width="11" height="13" fill="#fff" stroke="#000" />
    <rect x="4" y="4" width="8" height="1" fill="#a0a0a0" />
    <rect x="4" y="7" width="8" height="2" fill="#000" />
    <rect x="4" y="11" width="8" height="1" fill="#a0a0a0" />
  </Icon>
);

export const CodeBlockIcon = () => (
  <Icon>
    <rect x="1.5" y="2.5" width="13" height="11" fill="#fff" stroke="#000" />
    <text
      x="8"
      y="11"
      textAnchor="middle"
      fontFamily="Courier New, monospace"
      fontWeight="bold"
      fontSize="9"
      fill="#000"
    >
      {"{}"}
    </text>
  </Icon>
);

export const HelpIcon = () => (
  <Icon>
    <path
      d="M2.5 2.5H13.5V10.5H8L5 13.5V10.5H2.5Z"
      fill="#fff"
      stroke="#000"
      shapeRendering="auto"
    />
    <text
      x="8"
      y="9.5"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontWeight="bold"
      fontSize="8"
      fill="#0000c0"
    >
      ?
    </text>
  </Icon>
);

export const BulletedListIcon = () => (
  <Icon>
    <rect x="2" y="2" width="3" height="3" fill="#000" />
    <rect x="2" y="7" width="3" height="3" fill="#000" />
    <rect x="2" y="12" width="3" height="3" fill="#000" />
    <rect x="7" y="3" width="8" height="1" fill="#000" />
    <rect x="7" y="8" width="8" height="1" fill="#000" />
    <rect x="7" y="13" width="8" height="1" fill="#000" />
  </Icon>
);

export const NumberedListIcon = () => (
  <Icon>
    <Pixels rows={[".#.", "##.", ".#.", ".#.", ".#."]} x={1} y={0} />
    <Pixels rows={["###", "..#", "###", "#..", "###"]} x={1} y={5} />
    <Pixels rows={["###", "..#", ".##", "..#", "###"]} x={1} y={11} />
    <rect x="6" y="2" width="9" height="1" fill="#000" />
    <rect x="6" y="7" width="9" height="1" fill="#000" />
    <rect x="6" y="13" width="9" height="1" fill="#000" />
  </Icon>
);

const INDENT_LINES = (
  <>
    <rect x="1" y="1" width="14" height="1" fill="#000" />
    <rect x="7" y="4" width="8" height="1" fill="#000" />
    <rect x="7" y="7" width="8" height="1" fill="#000" />
    <rect x="7" y="10" width="8" height="1" fill="#000" />
    <rect x="1" y="13" width="14" height="1" fill="#000" />
  </>
);

export const IndentIcon = () => (
  <Icon>
    {INDENT_LINES}
    <Pixels
      rows={["#...", "##..", "###.", "####", "###.", "##..", "#..."]}
      x={1}
      y={4}
    />
  </Icon>
);

export const OutdentIcon = () => (
  <Icon>
    {INDENT_LINES}
    <Pixels
      rows={["...#", "..##", ".###", "####", ".###", "..##", "...#"]}
      x={1}
      y={4}
    />
  </Icon>
);

export const DropdownArrowIcon = () => (
  <Icon width={7} height={4}>
    <Pixels rows={["#######", ".#####.", "..###..", "...#..."]} />
  </Icon>
);

export const CheckIcon = () => (
  <Icon width={7} height={7}>
    <Pixels
      rows={[
        "......#",
        ".....##",
        "#...##.",
        "##.##..",
        ".###...",
        "..#....",
        "...#...",
      ]}
    />
  </Icon>
);

export const RadioIcon = () => (
  <Icon width={4} height={4}>
    <Pixels rows={[".##.", "####", "####", ".##."]} />
  </Icon>
);

export const CloseIcon = () => (
  <Icon width={8} height={7}>
    <Pixels
      rows={[
        "##...##",
        ".##.##.",
        "..###..",
        "...#...",
        "..###..",
        ".##.##.",
        "##...##",
      ]}
    />
  </Icon>
);
