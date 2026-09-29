"use client";

import AnimationsPauseButton from "@/app/components/AnimationsPauseButton";
import { setAnimationsPausedCookie } from "@/app/lib/animationsPausedCookie";
import { useHydrated } from "@/app/lib/useHydrated";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { ReactNode, useState } from "react";

const ProjectAnimations = ({
  initialPaused,
  title,
  backLink = false,
  className,
  children,
}: {
  initialPaused: boolean;
  title: string;
  backLink?: boolean;
  className: string;
  children: ReactNode;
}) => {
  const hydrated = useHydrated();
  const [paused, setPaused] = useState(initialPaused);

  const togglePaused = () => {
    setAnimationsPausedCookie(!paused);
    setPaused(!paused);
  };

  return (
    <div data-animated={paused ? undefined : true} className={className}>
      <div className="flex flex-col items-start gap-3">
        {backLink && (
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-slate-400
              hover:text-slate-200 hover:underline"
          >
            <ArrowLeftIcon className="size-4" />
            Projects
          </Link>
        )}
        <h1 className="text-4xl font-bold">{title}</h1>
        <div className={`-ml-1 ${hydrated ? "" : "invisible"}`}>
          <AnimationsPauseButton paused={paused} onToggle={togglePaused} />
        </div>
      </div>
      {children}
    </div>
  );
};

export default ProjectAnimations;
