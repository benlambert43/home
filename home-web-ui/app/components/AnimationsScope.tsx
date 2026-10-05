"use client";

import { useAnimationsPaused } from "@/app/lib/useAnimationsPaused";
import { ReactNode } from "react";

const AnimationsScope = ({
  className,
  children,
}: Readonly<{ className: string; children: ReactNode }>) => {
  const { paused } = useAnimationsPaused();

  return (
    <div data-animations-paused={paused || undefined} className={className}>
      {children}
    </div>
  );
};

export default AnimationsScope;
