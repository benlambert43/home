"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";

export const ANIMATION_BUTTON_CLASSES =
  "rounded p-1 text-slate-500 hover:cursor-pointer hover:text-slate-300";

const AnimationsPauseButton = ({
  paused,
  onToggle,
}: {
  paused: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    title={paused ? "Play animations" : "Pause animations"}
    onClick={onToggle}
    className={ANIMATION_BUTTON_CLASSES}
  >
    {paused ? (
      <PlayIcon className="size-4" />
    ) : (
      <PauseIcon className="size-4" />
    )}
  </button>
);

export default AnimationsPauseButton;
