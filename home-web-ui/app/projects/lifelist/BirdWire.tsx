import Birds from "@/app/projects/lifelist/Birds";
import {
  WIRE_HEIGHT,
  WIRE_PATH,
  WIRE_WIDTH,
} from "@/app/projects/lifelist/wire";

const BirdWire = ({ className }: { className: string }) => (
  <svg
    viewBox={`0 0 ${WIRE_WIDTH} ${WIRE_HEIGHT}`}
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Birds perched on a wire"
  >
    <path
      d={WIRE_PATH}
      pathLength={1}
      strokeDasharray="1 1.02"
      className="animated:motion-safe:animate-draw fill-none stroke-slate-500"
      strokeWidth={3}
      strokeLinecap="round"
    />
    <Birds />
  </svg>
);

export default BirdWire;
