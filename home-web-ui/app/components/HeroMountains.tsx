"use client";

import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import AnimationsPauseButton, {
  ANIMATION_BUTTON_CLASSES,
} from "@/app/components/AnimationsPauseButton";
import { useAnimationsPaused } from "@/app/lib/useAnimationsPaused";
import Mountains from "@/app/ui/Mountains";

const HeroMountains = () => {
  const { paused } = useAnimationsPaused();
  const [playCount, setPlayCount] = useState(0);

  const replay = () => {
    setPlayCount((count) => count + 1);
  };

  return (
    <>
      <div className="absolute top-2 left-4 flex gap-1">
        <AnimationsPauseButton />
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
      <div className="max-w-full overflow-clip">
        <Mountains key={playCount} />
      </div>
    </>
  );
};

export default HeroMountains;
