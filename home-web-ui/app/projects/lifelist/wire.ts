export const WIRE_WIDTH = 1200;
export const WIRE_HEIGHT = 260;

const WIRE_ENDS_Y = 120;
const WIRE_SAG_Y = 175;

export const WIRE_PATH = `M0 ${WIRE_ENDS_Y} Q${WIRE_WIDTH / 2} ${WIRE_SAG_Y} ${WIRE_WIDTH} ${WIRE_ENDS_Y}`;

export const wireY = (t: number) =>
  (1 - t) ** 2 * WIRE_ENDS_Y +
  2 * (1 - t) * t * WIRE_SAG_Y +
  t ** 2 * WIRE_ENDS_Y;
