"use client";

import { useScrolled } from "@/app/lib/useScrolled";
import { ReactNode } from "react";

const StickyNav = ({ children }: Readonly<{ children: ReactNode }>) => {
  const scrolled = useScrolled();

  return (
    <div
      className={`sticky z-10 mx-2 transition-[top] duration-300 ease-out ${
        scrolled ? "top-2" : "top-8"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -inset-x-2 -inset-y-8
          mask-y-from-[calc(100%-1.5rem)] backdrop-blur-md transition-opacity
          duration-300 ease-out ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        className={`relative flex flex-row flex-wrap-reverse items-center
          justify-between gap-x-8 gap-y-6 rounded-xl bg-slate-600 px-6 py-4
          transition-shadow duration-300 ease-out ${
            scrolled ? "shadow-xl shadow-slate-950/50" : "shadow-none"
          }`}
      >
        {children}
      </nav>
    </div>
  );
};

export default StickyNav;
