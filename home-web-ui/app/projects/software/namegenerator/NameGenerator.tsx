"use client";

import { useHydrated } from "@/app/lib/useHydrated";
import {
  formatProjectName,
  formatUsername,
  generateBatch,
} from "@/app/projects/software/namegenerator/words/generateNames";
import { BATCH_SIZE } from "@/app/projects/software/namegenerator/words/LIMITS";
import {
  GeneratedName,
  Mode,
  ProjectFormat,
  ProjectStyle,
  UsernameCase,
  UsernameDigits,
  UsernameSeparator,
} from "@/app/projects/software/namegenerator/words/types";
import Button from "@/app/ui/Button";
import SegmentedToggle from "@/app/ui/SegmentedToggle";

import {
  ArrowPathIcon,
  CheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/16/solid";
import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

type Option<T extends string> = { value: T; label: string };

const MODES: Option<Mode>[] = [
  { value: "project", label: "Project name" },
  { value: "username", label: "Username" },
];

const STYLES: Option<ProjectStyle>[] = [
  { value: "compound", label: "Two words" },
  { value: "invented", label: "Invented word" },
  { value: "mix", label: "Mix of both" },
];

const FORMATS: Option<ProjectFormat>[] = [
  { value: "pascal", label: "PascalCase" },
  { value: "kebab", label: "kebab-case" },
  { value: "lower", label: "lowercase" },
];

const SEPARATORS: Option<UsernameSeparator>[] = [
  { value: "none", label: "None" },
  { value: "underscore", label: "Underscore" },
  { value: "hyphen", label: "Hyphen" },
];

const DIGITS: Option<UsernameDigits>[] = [
  { value: "none", label: "None" },
  { value: "two", label: "2 digits" },
  { value: "four", label: "4 digits" },
];

const CASES: Option<UsernameCase>[] = [
  { value: "lower", label: "lowercase" },
  { value: "capital", label: "PascalCase" },
];

const COPIED_MS = 1500;

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
      {label}
    </span>
    {children}
  </div>
);

const GenerateButton = ({
  onClick,
  disabled = false,
}: {
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <Button type="button" size="large" disabled={disabled} onClick={onClick}>
    <span className="flex items-center justify-center gap-2">
      <ArrowPathIcon className="size-5" />
      Generate {BATCH_SIZE} new names
    </span>
  </Button>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <button
      type="button"
      aria-label={copied ? `Copied ${text}` : `Copy ${text}`}
      title="Copy to clipboard"
      onClick={() => {
        void copy();
      }}
      className="shrink-0 rounded-md p-2 text-slate-400 hover:cursor-pointer
        hover:bg-slate-700 hover:text-slate-100 focus:outline-slate-100"
    >
      {copied ? (
        <CheckIcon className="size-5 text-emerald-400" />
      ) : (
        <ClipboardDocumentIcon className="size-5" />
      )}
    </button>
  );
};

const RESULTS_GRID_CLASSES = "grid gap-3 sm:grid-cols-2";

const NameRow = ({ display, order }: { display: string; order: number }) => (
  <li
    className="animated:motion-safe:animate-rise flex items-center gap-3
      rounded-xl bg-slate-800/60 py-2.5 pr-2.5 pl-4 ring-1 ring-slate-700/80"
    style={{ "--rise-order": order * 0.4 } as CSSProperties}
  >
    <code
      className="min-w-0 grow truncate font-mono text-lg text-slate-50
        sm:text-xl"
    >
      {display}
    </code>
    <CopyButton text={display} />
  </li>
);

const Results = ({
  mode,
  style,
  display,
}: {
  mode: Mode;
  style: ProjectStyle;
  display: (name: GeneratedName) => string;
}) => {
  const [batch, setBatch] = useState(() => generateBatch(mode, style));

  return (
    <div className="flex flex-col gap-6">
      <ul aria-label="Generated names" className={RESULTS_GRID_CLASSES}>
        {batch.map((name, index) => (
          <NameRow key={name.id} display={display(name)} order={index} />
        ))}
      </ul>
      <div className="flex justify-center">
        <GenerateButton
          onClick={() => {
            setBatch(generateBatch(mode, style));
          }}
        />
      </div>
    </div>
  );
};

const ResultsPlaceholder = () => (
  <div className="flex flex-col gap-6">
    <ul aria-hidden className={RESULTS_GRID_CLASSES}>
      {Array.from({ length: BATCH_SIZE }, (_, index) => (
        <li
          key={index}
          className="animated:motion-safe:animate-pulse h-13 rounded-xl
            bg-slate-800/60 ring-1 ring-slate-700/80"
        />
      ))}
    </ul>
    <div className="flex justify-center">
      <GenerateButton disabled />
    </div>
  </div>
);

const NameGenerator = () => {
  const [mode, setMode] = useState<Mode>("project");
  const [style, setStyle] = useState<ProjectStyle>("mix");
  const [format, setFormat] = useState<ProjectFormat>("pascal");
  const [separator, setSeparator] = useState<UsernameSeparator>("none");
  const [digits, setDigits] = useState<UsernameDigits>("none");
  const [casing, setCasing] = useState<UsernameCase>("lower");
  const hydrated = useHydrated();

  const display = (name: GeneratedName) =>
    mode === "project"
      ? formatProjectName(name, format)
      : formatUsername(name, { separator, digits, casing });

  return (
    <section
      aria-label="Name generator"
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-2xl
        bg-slate-900 p-5 shadow-xl ring-1 shadow-slate-950/50 ring-slate-700
        sm:p-8"
    >
      <Field label="Name type">
        <SegmentedToggle
          label="Name type"
          options={MODES}
          value={mode}
          onChange={setMode}
        />
      </Field>
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {mode === "project" ? (
          <>
            <Field label="Style">
              <SegmentedToggle
                label="Style"
                options={STYLES}
                value={style}
                onChange={setStyle}
              />
            </Field>
            <Field label="Format">
              <SegmentedToggle
                label="Format"
                options={FORMATS}
                value={format}
                onChange={setFormat}
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Separator">
              <SegmentedToggle
                label="Separator"
                options={SEPARATORS}
                value={separator}
                onChange={setSeparator}
              />
            </Field>
            <Field label="Digits">
              <SegmentedToggle
                label="Digits"
                options={DIGITS}
                value={digits}
                onChange={setDigits}
              />
            </Field>
            <Field label="Case">
              <SegmentedToggle
                label="Case"
                options={CASES}
                value={casing}
                onChange={setCasing}
              />
            </Field>
          </>
        )}
      </div>
      {hydrated ? (
        <Results
          key={`${mode}-${style}`}
          mode={mode}
          style={style}
          display={display}
        />
      ) : (
        <ResultsPlaceholder />
      )}
    </section>
  );
};

export default NameGenerator;
