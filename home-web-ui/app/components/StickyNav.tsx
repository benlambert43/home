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
        className={`pointer-events-none absolute -inset-x-2 -inset-y-4
          mask-t-from-[calc(100%-0.5rem)] mask-b-from-[calc(100%-1rem)]
          backdrop-blur-xs transition-[opacity,visibility] duration-300 ease-out
          ${scrolled ? "opacity-100" : "invisible opacity-0"}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-xl shadow-lg
          shadow-slate-950/30 transition-opacity duration-300 ease-out
          ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        className="relative flex flex-row flex-wrap-reverse items-center
          justify-between gap-x-8 gap-y-6 rounded-xl bg-slate-600 px-6 py-4"
      >
        {children}
      </nav>
    </div>
  );
};

export default StickyNav;
