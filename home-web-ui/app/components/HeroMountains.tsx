"use client";

import { ArrowPathIcon, PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import {
  MOUNTAINS_PAUSED_COOKIE,
  MOUNTAINS_PLAYED_COOKIE,
} from "@/app/lib/heroMountains";
import Mountains from "@/app/ui/Mountains";

const PAUSED_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

const PLAYED_MAX_AGE_SECONDS = 60 * 30;

const BUTTON_CLASSES =
  "rounded p-1 text-slate-500 hover:cursor-pointer hover:text-slate-300";

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
    document.cookie = `${MOUNTAINS_PAUSED_COOKIE}=${!paused}; path=/; max-age=${PAUSED_MAX_AGE_SECONDS}; samesite=lax`;
    setPaused(!paused);
    if (paused) replay();
  };

  return (
    <>
      <div className="absolute top-2 left-4 flex gap-1">
        <button
          type="button"
          title={paused ? "Play header animations" : "Pause header animations"}
          onClick={togglePaused}
          className={BUTTON_CLASSES}
        >
          {paused ? (
            <PlayIcon className="size-4" />
          ) : (
            <PauseIcon className="size-4" />
          )}
        </button>
        {!paused && (
          <button
            type="button"
            title="Replay header animation"
            onClick={replay}
            className={BUTTON_CLASSES}
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
