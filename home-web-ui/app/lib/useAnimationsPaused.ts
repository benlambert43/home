import { AnimationsPausedContext } from "@/app/components/AnimationsPausedProvider";
import {
  readAnimationsPausedCookie,
  setAnimationsPausedCookie,
} from "@/app/lib/animationsPausedCookie";
import { useContext, useSyncExternalStore } from "react";

const subscribe = () => () => {};

export const useAnimationsPaused = () => {
  const { chosenPaused, choosePaused } = useContext(AnimationsPausedContext);
  const savedPaused = useSyncExternalStore(
    subscribe,
    readAnimationsPausedCookie,
    () => false,
  );
  const paused = chosenPaused ?? savedPaused;

  const togglePaused = () => {
    setAnimationsPausedCookie(!paused);
    choosePaused(!paused);
  };

  return { paused, togglePaused };
};
