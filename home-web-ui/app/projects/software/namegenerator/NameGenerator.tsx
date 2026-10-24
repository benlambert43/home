"use client";

import {
  MAX_FAVORITES,
  useFavorites,
} from "@/app/projects/software/namegenerator/favorites";
import {
  CASES,
  DIGITS,
  FORMATS,
  GeneratorSettings,
  GeneratorState,
  generatorSearch,
  LENGTHS,
  MODES,
  SEPARATORS,
  STYLES,
  THEMES,
} from "@/app/projects/software/namegenerator/generatorState";
import {
  formatProjectName,
  formatUsername,
  generateBatch,
  normalizeKeyword,
} from "@/app/projects/software/namegenerator/words/generateNames";
import { BATCH_SIZE } from "@/app/projects/software/namegenerator/words/LIMITS";
import { randomSeed } from "@/app/projects/software/namegenerator/words/random";
import { GeneratedName } from "@/app/projects/software/namegenerator/words/types";
import Button from "@/app/ui/Button";
import SegmentedToggle from "@/app/ui/SegmentedToggle";
import { FIELD_CLASSES } from "@/app/ui/fieldStyles";
import {
  ArrowPathIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { usePathname } from "next/navigation";
import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Option<T extends string> = { value: T; label: string };

const labelled = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): Option<T>[] => values.map((value) => ({ value, label: labels[value] }));

const MODE_OPTIONS = labelled(MODES, {
  project: "Project name",
  username: "Username",
});

const STYLE_OPTIONS = labelled(STYLES, {
  compound: "Two words",
  triple: "Three words",
  invented: "Invented word",
  mix: "Mix of styles",
});

const FORMAT_OPTIONS = labelled(FORMATS, {
  pascal: "PascalCase",
  kebab: "kebab-case",
  lower: "lowercase",
});

const LENGTH_OPTIONS = labelled(LENGTHS, {
  short: "Short",
  medium: "Medium",
  long: "Long",
});

const THEME_OPTIONS = labelled(THEMES, {
  any: "Any",
  nature: "Nature",
  space: "Space",
  workshop: "Workshop",
  mythology: "Mythology",
  kitchen: "Kitchen",
  tech: "Tech",
});

const SEPARATOR_OPTIONS = labelled(SEPARATORS, {
  none: "None",
  underscore: "Underscore",
  hyphen: "Hyphen",
});

const DIGIT_OPTIONS = labelled(DIGITS, {
  none: "None",
  two: "2 digits",
  four: "4 digits",
});

const CASE_OPTIONS = labelled(CASES, {
  lower: "lowercase",
  capital: "PascalCase",
});

const COPIED_MS = 1500;

const generateLabel = (keyword: string | undefined) =>
  keyword === undefined
    ? `Generate ${BATCH_SIZE} new names`
    : `Generate names from “${keyword}”`;

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
      {label}
    </span>
    {children}
  </div>
);

const IconButton = ({
  label,
  title,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={title}
    disabled={disabled}
    onClick={onClick}
    className="shrink-0 rounded-md p-2 text-slate-400 hover:cursor-pointer
      hover:bg-slate-700 hover:text-slate-100 focus:outline-slate-100
      disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent
      disabled:hover:text-slate-400"
  >
    {children}
  </button>
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
    <IconButton
      label={copied ? `Copied ${text}` : `Copy ${text}`}
      title="Copy to clipboard"
      onClick={() => {
        void copy();
      }}
    >
      {copied ? (
        <CheckIcon className="size-5 text-emerald-400" />
      ) : (
        <ClipboardDocumentIcon className="size-5" />
      )}
    </IconButton>
  );
};

const RESULTS_GRID_CLASSES = "grid gap-3 sm:grid-cols-2";

const ROW_CLASSES =
  "flex h-14 items-center gap-2 rounded-xl bg-slate-800/60 py-2.5 pr-2.5 pl-4 ring-1";

const NAME_TEXT_CLASSES =
  "min-w-0 grow truncate font-mono text-lg text-slate-50 sm:text-xl";

const NameRow = ({
  display,
  order,
  animate,
  favorite,
  favoritesFull,
  onToggleFavorite,
}: {
  display: string;
  order: number;
  animate: boolean;
  favorite: boolean;
  favoritesFull: boolean;
  onToggleFavorite: () => void;
}) => (
  <li
    className={`${ROW_CLASSES} ring-slate-700/80 ${
      animate ? "animated:motion-safe:animate-rise" : ""
    }`}
    style={{ "--rise-order": order * 0.4 } as CSSProperties}
  >
    <code className={NAME_TEXT_CLASSES}>{display}</code>
    <span className="flex shrink-0 items-center">
      <IconButton
        label={
          favorite
            ? `Remove ${display} from favorites`
            : `Add ${display} to favorites`
        }
        title={
          favorite
            ? "Remove from favorites"
            : favoritesFull
              ? `Favorites are full (${MAX_FAVORITES})`
              : "Add to favorites"
        }
        disabled={!favorite && favoritesFull}
        onClick={onToggleFavorite}
      >
        <StarIcon className={`size-5 ${favorite ? "text-amber-400" : ""}`} />
      </IconButton>
      <CopyButton text={display} />
    </span>
  </li>
);

const FavoritesList = () => {
  const { favorites, remove } = useFavorites();

  return (
    <div className="flex flex-col gap-3 border-t border-slate-800 pt-6">
      <h2 className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        Favorites ({favorites.length} of {MAX_FAVORITES})
      </h2>
      <ul aria-label="Favorite names" className={RESULTS_GRID_CLASSES}>
        {Array.from({ length: MAX_FAVORITES }, (_, index) => {
          const text = favorites[index];

          return text === undefined ? (
            <li
              key={index}
              aria-hidden
              className="h-14 rounded-xl border border-dashed border-slate-700"
            />
          ) : (
            <li key={text} className={`${ROW_CLASSES} ring-amber-400/40`}>
              <code className={NAME_TEXT_CLASSES}>{text}</code>
              <span className="flex shrink-0 items-center">
                <CopyButton text={text} />
                <IconButton
                  label={`Remove ${text} from favorites`}
                  title="Remove from favorites"
                  onClick={() => {
                    remove(text);
                  }}
                >
                  <XMarkIcon className="size-5" />
                </IconButton>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm text-slate-400">
        Star a name to keep it here. Favorites are saved in this browser only.
      </p>
    </div>
  );
};

const NameGenerator = ({ initial }: { initial: GeneratorState }) => {
  const pathname = usePathname();
  const [state, setState] = useState(initial);
  const [draft, setDraft] = useState(initial.keyword ?? "");
  const [generation, setGeneration] = useState(0);
  const wordInput = useRef<HTMLInputElement>(null);
  const { favorites, add, remove, full } = useFavorites();

  const { mode, style, length, theme, keyword, seed } = state;
  const { format, separator, digits, casing } = state;

  const batch = useMemo(
    () => generateBatch({ mode, style, length, theme, keyword }, seed),
    [mode, style, length, theme, keyword, seed],
  );

  const update = (changes: Partial<GeneratorState>) => {
    const next = { ...state, ...changes };
    setState(next);
    setGeneration((count) => count + 1);
    window.history.replaceState(
      null,
      "",
      `${pathname}${generatorSearch(next)}`,
    );
  };

  const change =
    <Key extends keyof GeneratorSettings>(key: Key) =>
    (value: GeneratorSettings[Key]) => {
      update({ [key]: value });
    };

  const applyKeyword = () => {
    const next = normalizeKeyword(draft);
    if (next !== keyword) update({ keyword: next });
  };

  const clearKeyword = () => {
    setDraft("");
    if (keyword !== undefined) update({ keyword: undefined });
    wordInput.current?.focus();
  };

  const unusableDraft =
    draft.trim() !== "" && normalizeKeyword(draft) === undefined;

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
          options={MODE_OPTIONS}
          value={mode}
          onChange={change("mode")}
        />
      </Field>
      <Field label="Start from a word (optional)">
        <div className="relative w-full max-w-78">
          <input
            ref={wordInput}
            type="text"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
            }}
            onBlur={applyKeyword}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyKeyword();
              }
            }}
            placeholder="harbor"
            maxLength={32}
            autoComplete="off"
            spellCheck={false}
            aria-label="Start from a word"
            className={`w-full pr-11 ${FIELD_CLASSES}`}
          />
          {draft !== "" && (
            <span className="absolute inset-y-0 right-1 flex items-center">
              <IconButton
                label="Clear the word"
                title="Clear"
                onClick={clearKeyword}
              >
                <XMarkIcon className="size-5" />
              </IconButton>
            </span>
          )}
        </div>
        {unusableDraft && (
          <p className="text-sm text-slate-400">
            Use 2 to 12 letters; other characters are dropped.
          </p>
        )}
      </Field>
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <Field label="Length">
          <SegmentedToggle
            label="Length"
            options={LENGTH_OPTIONS}
            value={length}
            onChange={change("length")}
          />
        </Field>
        <Field label="Theme">
          <SegmentedToggle
            label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            onChange={change("theme")}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {mode === "project" ? (
          <>
            <Field label="Style">
              <SegmentedToggle
                label="Style"
                options={STYLE_OPTIONS}
                value={style}
                onChange={change("style")}
              />
            </Field>
            <Field label="Format">
              <SegmentedToggle
                label="Format"
                options={FORMAT_OPTIONS}
                value={format}
                onChange={change("format")}
              />
            </Field>
          </>
        ) : (
          <>
            <Field label="Separator">
              <SegmentedToggle
                label="Separator"
                options={SEPARATOR_OPTIONS}
                value={separator}
                onChange={change("separator")}
              />
            </Field>
            <Field label="Digits">
              <SegmentedToggle
                label="Digits"
                options={DIGIT_OPTIONS}
                value={digits}
                onChange={change("digits")}
              />
            </Field>
            <Field label="Case">
              <SegmentedToggle
                label="Case"
                options={CASE_OPTIONS}
                value={casing}
                onChange={change("casing")}
              />
            </Field>
          </>
        )}
      </div>
      <div className="flex flex-col gap-6">
        {batch.length === 0 ? (
          <p className="text-slate-300">
            Nothing fits that word with these settings. Try another length or
            style.
          </p>
        ) : (
          <ul aria-label="Generated names" className={RESULTS_GRID_CLASSES}>
            {batch.map((name, index) => {
              const text = display(name);
              const favorite = favorites.includes(text);

              return (
                <NameRow
                  key={name.id}
                  display={text}
                  order={index}
                  animate={generation > 0}
                  favorite={favorite}
                  favoritesFull={full}
                  onToggleFavorite={() => {
                    if (favorite) remove(text);
                    else add(text);
                  }}
                />
              );
            })}
          </ul>
        )}
        <div className="flex justify-center">
          <Button
            type="button"
            size="large"
            onClick={() => {
              update({ seed: randomSeed() });
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowPathIcon className="size-5" />
              {generateLabel(keyword)}
            </span>
          </Button>
        </div>
      </div>
      <FavoritesList />
    </section>
  );
};

export default NameGenerator;
