import WindowDots from "@/app/projects/software/WindowDots";
import {
  ArrowUpRightIcon,
  CodeBracketIcon,
  CommandLineIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { CSSProperties } from "react";

const STACK = ["Next.js", "React", "Tailwind", "Express", "MongoDB"];

const FOOTER_LINK_CLASSES =
  "flex items-center gap-1 text-slate-300 transition-colors hover:text-slate-50 hover:underline";

const SoftwareWindows = () => (
  <ul className="grid gap-5 sm:grid-cols-2">
    <li className="animated:motion-safe:animate-rise">
      <article
        className="flex h-full flex-col overflow-clip rounded-xl bg-slate-900
          shadow-lg ring-1 shadow-slate-950/40 ring-slate-700 transition-shadow
          duration-300 hover:shadow-xl hover:ring-slate-500"
      >
        <header
          className="flex items-center gap-3 bg-slate-800/80 px-3 py-2 font-mono
            text-xs text-slate-400"
        >
          <WindowDots />
          <span className="truncate">benlambert.tech</span>
          <span
            className="ml-auto shrink-0 rounded-full bg-slate-700 px-2 py-0.5
              text-slate-200"
          >
            App
          </span>
        </header>
        <div className="flex grow flex-col gap-3 p-4">
          <h2 className="text-lg font-semibold">benlambert.tech</h2>
          <p className="text-slate-300">
            This website: a Next.js front end over an Express and MongoDB API,
            with a Markdown blog, image uploads, accounts and notifications.
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {STACK.map((item) => (
              <li
                key={item}
                className="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs
                  text-slate-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <footer
          className="flex items-center gap-4 border-t border-slate-800 px-4 py-3
            text-sm"
        >
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="size-2 rounded-full bg-emerald-400" />
            Live
          </span>
          <span className="ml-auto flex gap-4">
            <Link href="/" className={FOOTER_LINK_CLASSES}>
              Open <ArrowUpRightIcon className="size-4" />
            </Link>
            <Link
              href="https://github.com/benlambert43/home"
              target="_blank"
              rel="noopener noreferrer"
              className={FOOTER_LINK_CLASSES}
            >
              Source <CodeBracketIcon className="size-4" />
            </Link>
          </span>
        </footer>
      </article>
    </li>
    <li
      className="animated:motion-safe:animate-rise"
      style={{ "--rise-order": 1 } as CSSProperties}
    >
      <div
        className="flex h-full min-h-40 flex-col items-center justify-center
          gap-2 rounded-xl border border-dashed border-slate-600 p-6
          text-slate-500"
      >
        <CommandLineIcon className="size-6" />
        <span className="font-mono text-xs">More coming soon</span>
      </div>
    </li>
  </ul>
);

export default SoftwareWindows;
