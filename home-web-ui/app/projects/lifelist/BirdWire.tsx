"use client";

import { useBirdCount } from "@/app/projects/lifelist/useBirdCount";
import { CSSProperties } from "react";

const WIDTH = 1200;
const HEIGHT = 260;
const WIRE_ENDS_Y = 120;
const WIRE_SAG_Y = 175;
const BIRD_SCALE = 1.5;
const FIRST_BIRD_DELAY_MS = 700;
const BIRD_STAGGER_MS = 220;

const WIRE_PATH = `M0 ${WIRE_ENDS_Y} Q${WIDTH / 2} ${WIRE_SAG_Y} ${WIDTH} ${WIRE_ENDS_Y}`;

const wireY = (t: number) =>
  (1 - t) ** 2 * WIRE_ENDS_Y +
  2 * (1 - t) * t * WIRE_SAG_Y +
  t ** 2 * WIRE_ENDS_Y;

const Bird = ({ index, count }: { index: number; count: number }) => {
  const t = (index + 1) / (count + 1);
  const facing = index % 2 === 0 ? 1 : -1;

  return (
    <g
      className="animated:motion-safe:animate-fly-in"
      style={
        {
          translate: `${(WIDTH * t).toFixed(1)}px ${wireY(t).toFixed(1)}px`,
          "--facing": facing,
          "--delay": FIRST_BIRD_DELAY_MS + index * BIRD_STAGGER_MS,
        } as CSSProperties
      }
    >
      <g transform={`scale(${facing * BIRD_SCALE} ${BIRD_SCALE})`}>
        <path
          d="M-3 -5V0M3 -5V0"
          className="stroke-slate-300"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path d="M-10 -10L-26 2L-22 6L-8 -6Z" className="fill-slate-300" />
        <ellipse cx={0} cy={-14} rx={14} ry={10} className="fill-slate-300" />
        <circle cx={11} cy={-26} r={7} className="fill-slate-300" />
        <path d="M17 -27L25 -25L17 -23Z" className="fill-slate-300" />
        <circle cx={13} cy={-27} r={1.3} className="fill-slate-900" />
      </g>
    </g>
  );
};

const BirdWire = ({ className }: { className: string }) => {
  const count = useBirdCount();

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={`${count} birds perched on a wire`}
    >
      <path
        d={WIRE_PATH}
        pathLength={1}
        strokeDasharray="1 1.02"
        className="animated:motion-safe:animate-draw fill-none stroke-slate-500"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {Array.from({ length: count }, (_, index) => (
        <Bird key={index} index={index} count={count} />
      ))}
    </svg>
  );
};

export default BirdWire;
