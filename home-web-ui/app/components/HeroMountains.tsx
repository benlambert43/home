"use client";

import { ArrowPathIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import AnimationsPauseButton, {
  ANIMATION_BUTTON_CLASSES,
} from "@/app/components/AnimationsPauseButton";
import { setAnimationsPausedCookie } from "@/app/lib/animationsPausedCookie";
import { MOUNTAINS_PLAYED_COOKIE } from "@/app/lib/heroMountains";
import Mountains from "@/app/ui/Mountains";

const PLAYED_MAX_AGE_SECONDS = 60 * 30;

const HeroMountains = ({
  autoplay,
  initialPaused,
}: {
  autoplay: boolean;
  initialPaused: boolean;
}) => {
  const [paused, setPaused] = useState(initialPaused);
  const [playCount, setPlayCount] = useState(autoplay ? 1 : 0);

  useEffect(() => {
    document.cookie = `${MOUNTAINS_PLAYED_COOKIE}=true; path=/; max-age=${PLAYED_MAX_AGE_SECONDS}; samesite=lax`;
  }, []);

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
      <div className="max-w-full overflow-clip">
        <Mountains key={playCount} animated={!paused && playCount > 0} />
      </div>
    </>
  );
};

export default HeroMountains;
