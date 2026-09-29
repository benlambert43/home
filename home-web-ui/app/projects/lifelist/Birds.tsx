"use client";

import { useBirdCount } from "@/app/projects/lifelist/useBirdCount";
import { WIRE_WIDTH, wireY } from "@/app/projects/lifelist/wire";
import { CSSProperties } from "react";

const BIRD_SCALE = 1.5;
const FIRST_BIRD_DELAY_MS = 700;
const BIRD_STAGGER_MS = 220;

const Bird = ({ index, count }: { index: number; count: number }) => {
  const t = (index + 1) / (count + 1);
  const facing = index % 2 === 0 ? 1 : -1;

  return (
    <g
      className="animated:motion-safe:animate-fly-in"
      style={
        {
          translate: `${(WIRE_WIDTH * t).toFixed(1)}px ${wireY(t).toFixed(1)}px`,
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

const Birds = () => {
  const count = useBirdCount();

  return Array.from({ length: count }, (_, index) => (
    <Bird key={index} index={index} count={count} />
  ));
};

export default Birds;
