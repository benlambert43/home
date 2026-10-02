"use client";

import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import AnimationsPauseButton, {
  ANIMATION_BUTTON_CLASSES,
} from "@/app/components/AnimationsPauseButton";
import { setAnimationsPausedCookie } from "@/app/lib/animationsPausedCookie";
import Mountains from "@/app/ui/Mountains";

const MOUNTAINS_FRAME_CLASSES = "max-w-full overflow-clip";

export const HeroMountainsPlaceholder = () => (
  <div className={`invisible ${MOUNTAINS_FRAME_CLASSES}`}>
    <Mountains animated={false} />
  </div>
);

const HeroMountains = ({ initialPaused }: { initialPaused: boolean }) => {
  const [paused, setPaused] = useState(initialPaused);
  const [playCount, setPlayCount] = useState(0);

  const replay = () => {
    setPlayCount((count) => count + 1);
  };

  const togglePaused = () => {
    setAnimationsPausedCookie(!paused);
    setPaused(!paused);
    if (paused) replay();
  };

  return (
    <>
      <div className="absolute top-2 left-4 flex gap-1">
        <AnimationsPauseButton paused={paused} onToggle={togglePaused} />
        {!paused && (
          <button
            type="button"
            title="Replay header animation"
            onClick={replay}
            className={ANIMATION_BUTTON_CLASSES}
          >
            <ArrowPathIcon className="size-4" />
          </button>
        )}
      </div>
      <div className={MOUNTAINS_FRAME_CLASSES}>
        <Mountains key={playCount} animated={!paused} />
      </div>
    </>
  );
};

export default HeroMountains;
