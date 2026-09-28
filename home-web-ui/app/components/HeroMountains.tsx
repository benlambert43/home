"use client";

import { ArrowPathIcon, PauseIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import {
  MOUNTAINS_PAUSED_COOKIE,
  MOUNTAINS_PLAYED_COOKIE,
  randomMountainEffect,
} from "@/app/lib/heroMountains";
import Mountains, { MountainEffect } from "@/app/ui/Mountains";

const PAUSED_MAX_AGE_SECONDS = 60 * 60 * 24 * 400;

const BUTTON_CLASSES =
  "rounded p-1 text-slate-500 hover:cursor-pointer hover:text-slate-300 aria-pressed:text-slate-300";

const HeroMountains = ({
  initialEffect,
  initialPaused,
}: {
  initialEffect: MountainEffect | null;
  initialPaused: boolean;
}) => {
  const [paused, setPaused] = useState(initialPaused);
  const [effect, setEffect] = useState(initialEffect);
  const [replays, setReplays] = useState(0);

  useEffect(() => {
    document.cookie = `${MOUNTAINS_PLAYED_COOKIE}=true; path=/; samesite=lax`;
  }, []);

  const togglePaused = () => {
    document.cookie = `${MOUNTAINS_PAUSED_COOKIE}=${!paused}; path=/; max-age=${PAUSED_MAX_AGE_SECONDS}; samesite=lax`;
    setPaused(!paused);
    setEffect(null);
  };

  const replay = () => {
    setEffect(randomMountainEffect());
    setReplays((count) => count + 1);
  };

  return (
    <>
      <div className="absolute top-1 left-7 flex gap-1">
        <button
          type="button"
          title="Pause header animations"
          aria-pressed={paused}
          onClick={togglePaused}
          className={BUTTON_CLASSES}
        >
          <PauseIcon className="size-4" />
        </button>
        <button
          type="button"
          title="Replay header animation"
          onClick={replay}
          className={BUTTON_CLASSES}
        >
          <ArrowPathIcon className="size-4" />
        </button>
      </div>
      <div className="max-w-full overflow-clip">
        <Mountains key={replays} effect={effect} />
      </div>
    </>
  );
};

export default HeroMountains;
