import { CSSProperties } from "react";

const WIDTH = 800;
const HEIGHT = 400;
const CONTOUR_POINTS = 36;
const CONTOUR_STRETCH = 1.6;
const CONTOUR_STAGGER_MS = 60;

const ROUTE_START_DELAY_MS = 400;
const ROUTE_DRAW_MS = 2600;

const ROUTE_PATH =
  "M70 350C120 340 160 300 220 290C280 280 320 320 370 290C420 260 400 220 450 205C500 190 540 215 560 190C575 170 570 145 590 130";

const TRAILHEAD = { x: 70, y: 350 };
const SUMMIT = { x: 590, y: 130 };

const PEAKS = [
  { cx: SUMMIT.x, cy: SUMMIT.y, radii: [22, 44, 66, 90, 116, 145, 178, 215] },
  { cx: 170, cy: 320, radii: [20, 45, 75, 110] },
];

type Point = { x: number; y: number };

const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

const coordinates = ({ x, y }: Point) => `${x.toFixed(1)} ${y.toFixed(1)}`;

const contourPath = (cx: number, cy: number, radius: number, seed: number) => {
  const points = Array.from({ length: CONTOUR_POINTS }, (_, k): Point => {
    const angle = (k / CONTOUR_POINTS) * Math.PI * 2;
    const wobble =
      1 +
      0.16 * Math.sin(3 * angle + seed) +
      0.08 * Math.cos(5 * angle - 2 * seed);
    return {
      x: cx + CONTOUR_STRETCH * radius * wobble * Math.cos(angle),
      y: cy + radius * wobble * Math.sin(angle),
    };
  });

  const start = midpoint(points[CONTOUR_POINTS - 1], points[0]);
  const curves = points.map((point, k) => {
    const next = points[(k + 1) % CONTOUR_POINTS];
    return `Q${coordinates(point)} ${coordinates(midpoint(point, next))}`;
  });

  return `M${coordinates(start)} ${curves.join(" ")}Z`;
};

const Contours = () =>
  PEAKS.map(({ cx, cy, radii }) =>
    radii.map((radius, index) => (
      <path
        key={`${cx}-${radius}`}
        d={contourPath(cx, cy, radius, index * 0.9 + cx)}
        vectorEffect="non-scaling-stroke"
        className="animated:motion-safe:animate-appear fill-slate-400/5
          stroke-slate-600 stroke-1"
        style={
          {
            "--delay": (radii.length - index) * CONTOUR_STAGGER_MS,
          } as CSSProperties
        }
      />
    )),
  );

const RouteMap = ({ className }: { className: string }) => (
  <svg
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="A route drawn across a contour map from the trailhead to the summit"
  >
    <Contours />
    <path
      d={ROUTE_PATH}
      pathLength={1}
      strokeDasharray="1 1.02"
      className="stroke-portrait-dusk animated:motion-safe:animate-draw
        fill-none"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ "--delay": ROUTE_START_DELAY_MS } as CSSProperties}
    />
    <g
      className="animated:motion-safe:animate-pop origin-center
        [transform-box:fill-box]"
      style={{ "--delay": ROUTE_START_DELAY_MS - 200 } as CSSProperties}
    >
      <circle
        cx={TRAILHEAD.x}
        cy={TRAILHEAD.y}
        r={6}
        className="fill-slate-200 stroke-slate-900"
        strokeWidth={2}
      />
    </g>
    <g
      className="animated:motion-safe:animate-appear"
      style={{ "--delay": ROUTE_START_DELAY_MS } as CSSProperties}
    >
      <circle
        r={7}
        className="fill-portrait-dusk animated:motion-safe:animate-travel
          stroke-slate-50"
        strokeWidth={2}
        style={{
          offsetPath: `path("${ROUTE_PATH}")`,
          offsetDistance: "100%",
        }}
      />
    </g>
    <g
      className="animated:motion-safe:animate-pop origin-center
        [transform-box:fill-box]"
      style={
        { "--delay": ROUTE_START_DELAY_MS + ROUTE_DRAW_MS } as CSSProperties
      }
    >
      <path
        d={`M${SUMMIT.x} ${SUMMIT.y - 26}l-9 16h18z`}
        className="fill-portrait-haze"
      />
    </g>
  </svg>
);

export default RouteMap;
