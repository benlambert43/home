import WindowDots from "@/app/projects/software/WindowDots";
import { FolderIcon } from "@heroicons/react/16/solid";
import { CSSProperties } from "react";

type TerminalLine =
  | { kind: "command"; text: string }
  | { kind: "output"; text: string; accent?: boolean };

const TITLE = "ben — ben@benlambert.tech — ~/software — -zsh — 80×24";

const LINES: TerminalLine[] = [
  { kind: "command", text: "whoami" },
  { kind: "output", text: "ben" },
  { kind: "command", text: "ls" },
  { kind: "output", text: "benlambert.tech/", accent: true },
];

const TYPE_MS = 45;
const INITIAL_PAUSE_MS = 400;
const PAUSE_BEFORE_COMMAND_MS = 500;
const PAUSE_AFTER_COMMAND_MS = 350;
const OUTPUT_GAP_MS = 70;

const schedule = (lines: TerminalLine[]) => {
  let clock = INITIAL_PAUSE_MS;

  const timed = lines.map((line) => {
    if (line.kind === "command") {
      clock += PAUSE_BEFORE_COMMAND_MS;
      const delay = clock;
      clock += line.text.length * TYPE_MS + PAUSE_AFTER_COMMAND_MS;
      return { line, delay };
    }

    const delay = clock;
    clock += OUTPUT_GAP_MS;
    return { line, delay };
  });

  return { timed, promptDelay: clock + PAUSE_BEFORE_COMMAND_MS };
};

const Prompt = () => (
  <span className="font-bold whitespace-pre text-emerald-400">➜ </span>
);

const Cursor = ({ className }: { className: string }) => (
  <span aria-hidden className={`w-[1ch] bg-slate-400 ${className}`} />
);

const CommandLine = ({ text, delay }: { text: string; delay: number }) => (
  <div
    className="flex"
    style={{ "--chars": text.length, "--delay": delay } as CSSProperties}
  >
    <Prompt />
    <span
      className="animated:motion-safe:animate-type w-[calc(var(--chars)*1ch)]
        overflow-clip whitespace-nowrap"
    >
      {text}
    </span>
    <Cursor className="animated:motion-safe:animate-cursor opacity-0" />
  </div>
);

const OutputLine = ({
  text,
  accent,
  delay,
}: {
  text: string;
  accent?: boolean;
  delay: number;
}) => (
  <div
    className={`animated:motion-safe:animate-appear whitespace-pre-wrap
      ${accent ? "text-portrait-sky" : ""}`}
    style={{ "--delay": delay } as CSSProperties}
  >
    {text}
  </div>
);

const Terminal = () => {
  const { timed, promptDelay } = schedule(LINES);

  return (
    <div
      className="overflow-clip rounded-xl bg-slate-950 font-mono text-sm
        shadow-xl ring-1 shadow-slate-950/50 ring-slate-700"
      style={{ "--type-ms": `${TYPE_MS}ms` } as CSSProperties}
    >
      <div
        className="relative flex items-center justify-center bg-slate-900 px-16
          py-2"
      >
        <div className="absolute left-3">
          <WindowDots />
        </div>
        <span
          className="flex min-w-0 items-center gap-1.5 text-xs text-slate-400"
        >
          <FolderIcon className="size-3.5 shrink-0 text-sky-400" />
          <span className="truncate">{TITLE}</span>
        </span>
      </div>
      <div className="flex flex-col gap-1 p-4 text-slate-200">
        {timed.map(({ line, delay }, index) =>
          line.kind === "command" ? (
            <CommandLine key={index} text={line.text} delay={delay} />
          ) : (
            <OutputLine
              key={index}
              text={line.text}
              accent={line.accent}
              delay={delay}
            />
          ),
        )}
        <div
          className="animated:motion-safe:animate-appear flex"
          style={{ "--delay": promptDelay } as CSSProperties}
        >
          <Prompt />
          <Cursor className="animated:motion-safe:animate-blink" />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
