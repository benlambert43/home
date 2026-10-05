"use client";

import { createContext, ReactNode, useState } from "react";

type AnimationsPausedContextValue = {
  chosenPaused: boolean | undefined;
  choosePaused: (paused: boolean) => void;
};

const defaultAnimationsPausedContext: AnimationsPausedContextValue = {
  chosenPaused: undefined,
  choosePaused: () => {},
};

export const AnimationsPausedContext = createContext(
  defaultAnimationsPausedContext,
);

const AnimationsPausedProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const [chosenPaused, choosePaused] = useState<boolean>();

  return (
    <AnimationsPausedContext value={{ chosenPaused, choosePaused }}>
      {children}
    </AnimationsPausedContext>
  );
};

export default AnimationsPausedProvider;
