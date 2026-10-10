"use client";

import { useAnimationsPaused } from "@/app/lib/useAnimationsPaused";
import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";

const AnimationsPauseButton = () => {
  const { paused, togglePaused } = useAnimationsPaused();

  return (
    <button
      type="button"
      title={paused ? "Play animations" : "Pause animations"}
      onClick={togglePaused}
      className={
        paused
          ? `rounded-md p-1 text-slate-100 hover:cursor-pointer
            hover:bg-slate-700`
          : `rounded p-1 text-slate-500 hover:cursor-pointer
            hover:text-slate-300`
      }
    >
      {paused ? (
        <PlayIcon className="size-4" />
      ) : (
        <PauseIcon className="size-4" />
      )}
    </button>
  );
};

export default AnimationsPauseButton;
