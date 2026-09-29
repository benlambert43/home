"use client";

import AnimationsPauseButton from "@/app/components/AnimationsPauseButton";
import { setAnimationsPausedCookie } from "@/app/lib/animationsPausedCookie";
import { useHydrated } from "@/app/lib/useHydrated";
import ProjectHeading from "@/app/projects/ProjectHeading";
import { useState } from "react";

const AnimationsControl = ({
  initialPaused,
  title,
  backLink,
}: {
  initialPaused: boolean;
  title: string;
  backLink: boolean;
}) => {
  const hydrated = useHydrated();
  const [paused, setPaused] = useState(initialPaused);

  const togglePaused = () => {
    setAnimationsPausedCookie(!paused);
    setPaused(!paused);
  };

  return (
    <ProjectHeading title={title} backLink={backLink} animated={!paused}>
      <div className={hydrated ? undefined : "invisible"}>
        <AnimationsPauseButton paused={paused} onToggle={togglePaused} />
      </div>
    </ProjectHeading>
  );
};

export default AnimationsControl;
