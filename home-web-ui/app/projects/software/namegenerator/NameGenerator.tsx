"use client";

import {
  Favorite,
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
import {
  BATCH_SIZE,
  MAX_PINS,
} from "@/app/projects/software/namegenerator/words/LIMITS";
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
  any: "Any",
  compound: "Two words",
  triple: "Three words",
  invented: "Invented word",
  mix: "Mix of Styles",
});

const FORMAT_OPTIONS = labelled(FORMATS, {
  pascal: "PascalCase",
  kebab: "kebab-case",
  lower: "lowercase",
});

const LENGTH_OPTIONS = labelled(LENGTHS, {
  any: "Any",
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

const isWord = (word: string | undefined): word is string => word !== undefined;

const PIN_LIST = new Intl.ListFormat("en", { type: "disjunction" });

const generateLabel = (pinned: readonly string[]) =>
  pinned.length === 0
    ? `Generate ${BATCH_SIZE} new names`
    : `Generate names from ${PIN_LIST.format(pinned.map((word) => `“${word}”`))}`;

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
  compact = false,
  onClick,
  children,
}: {
  label: string;
  title: string;
  disabled?: boolean;
  compact?: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`shrink-0 rounded-md text-slate-400 hover:cursor-pointer
      hover:bg-slate-700 hover:text-slate-100 focus:outline-slate-100
      disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent
      disabled:hover:text-slate-400 ${compact ? "p-1" : "p-2"}`}
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

const ROW_CLASSES = "rounded-xl bg-slate-800/60 py-2.5 pr-2.5 pl-4 ring-1";

const NAME_TEXT_CLASSES =
  "min-w-0 grow truncate font-mono text-lg text-slate-50 sm:text-xl";

const PIN_CHIP_CLASSES = "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/70";

const WordChip = ({
  word,
  pinned,
  pinsFull,
  onToggle,
}: {
  word: string;
  pinned: boolean;
  pinsFull: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    aria-pressed={pinned}
    disabled={!pinned && pinsFull}
    title={
      pinned
        ? "Unpin this word"
        : pinsFull
          ? `Only ${MAX_PINS} words can be pinned`
          : "Pin this word for the next names"
    }
    onClick={onToggle}
    className={`rounded-full px-2.5 py-0.5 text-xs font-medium
      hover:cursor-pointer focus:outline-slate-100 disabled:cursor-default
      disabled:opacity-40 ${
        pinned
          ? PIN_CHIP_CLASSES
          : `bg-slate-700/60 text-slate-300 ring-1 ring-slate-600
            hover:bg-slate-600 hover:text-slate-50`
      }`}
  >
    {word}
  </button>
);

const WordChips = ({
  label,
  parts,
  pinned,
  onTogglePin,
}: {
  label: string;
  parts: readonly string[];
  pinned: readonly string[];
  onTogglePin: (word: string) => void;
}) => (
  <ul aria-label={label} className="flex flex-wrap gap-1.5 pt-2">
    {parts.map((word) => (
      <li key={word}>
        <WordChip
          word={word}
          pinned={pinned.includes(word)}
          pinsFull={pinned.length >= MAX_PINS}
          onToggle={() => {
            onTogglePin(word);
          }}
        />
      </li>
    ))}
  </ul>
);

const NameRow = ({
  name,
  display,
  order,
  animate,
  favorite,
  favoritesFull,
  pinned,
  onToggleFavorite,
  onTogglePin,
}: {
  name: GeneratedName;
  display: string;
  order: number;
  animate: boolean;
  favorite: boolean;
  favoritesFull: boolean;
  pinned: readonly string[];
  onToggleFavorite: () => void;
  onTogglePin: (word: string) => void;
}) => (
  <li
    className={`${ROW_CLASSES} flex flex-col ring-slate-700/80 ${
      animate ? "animated:motion-safe:animate-rise" : ""
    }`}
    style={{ "--rise-order": order * 0.4 } as CSSProperties}
  >
    <div className="flex min-h-9 items-center gap-2">
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
    </div>
    <WordChips
      label={`Words in ${display}`}
      parts={name.parts}
      pinned={pinned}
      onTogglePin={onTogglePin}
    />
  </li>
);

const FavoritesList = ({
  favorites,
  pinned,
  onRemove,
  onTogglePin,
}: {
  favorites: readonly Favorite[];
  pinned: readonly string[];
  onRemove: (text: string) => void;
  onTogglePin: (word: string) => void;
}) => (
  <div className="flex flex-col gap-3 border-t border-slate-800 pt-6">
    <h2 className="text-xs font-medium tracking-wide text-slate-400 uppercase">
      Favorites ({favorites.length} of {MAX_FAVORITES})
    </h2>
    <ul aria-label="Favorite names" className={RESULTS_GRID_CLASSES}>
      {Array.from({ length: MAX_FAVORITES }, (_, index) => {
        const favorite = favorites[index];

        if (favorite === undefined) {
          return (
            <li
              key={index}
              aria-hidden
              className="min-h-21 rounded-xl border border-dashed
                border-slate-700"
            />
          );
        }

        const { text, parts } = favorite;

        return (
          <li
            key={text}
            className={`${ROW_CLASSES} flex flex-col ring-amber-400/40`}
          >
            <div className="flex min-h-9 items-center gap-2">
              <code className={NAME_TEXT_CLASSES}>{text}</code>
              <span className="flex shrink-0 items-center">
                <CopyButton text={text} />
                <IconButton
                  label={`Remove ${text} from favorites`}
                  title="Remove from favorites"
                  onClick={() => {
                    onRemove(text);
                  }}
                >
                  <XMarkIcon className="size-5" />
                </IconButton>
              </span>
            </div>
            {parts.length > 0 && (
              <WordChips
                label={`Words in ${text}`}
                parts={parts}
                pinned={pinned}
                onTogglePin={onTogglePin}
              />
            )}
          </li>
        );
      })}
    </ul>
  </div>
);

const NameGenerator = ({ initial }: { initial: GeneratorState }) => {
  const pathname = usePathname();
  const [state, setState] = useState(initial);
  const [draft, setDraft] = useState(initial.keyword ?? "");
  const [generation, setGeneration] = useState(0);
  const wordInput = useRef<HTMLInputElement>(null);
  const { favorites, has, add, remove, full } = useFavorites();

  const { mode, style, length, theme, keyword, pins, seed } = state;
  const { format, separator, digits, casing } = state;
  const pinKey = pins.join(",");
  const pinned = keyword === undefined ? pins : [keyword, ...pins];

  const batch = useMemo(
    () =>
      generateBatch(
        {
          mode,
          style,
          length,
          theme,
          keyword,
          pins: pinKey === "" ? [] : pinKey.split(","),
        },
        seed,
      ),
    [mode, style, length, theme, keyword, pinKey, seed],
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
    if (next === keyword) return;
    update({
      keyword: next,
      pins:
        next === undefined
          ? pins
          : pins.filter((pin) => pin !== next).slice(0, MAX_PINS - 1),
    });
  };

  const removeKeyword = () => {
    setDraft("");
    if (keyword !== undefined) update({ keyword: undefined });
  };

  const togglePin = (word: string) => {
    if (word === keyword) {
      removeKeyword();
    } else if (pins.includes(word)) {
      update({ pins: pins.filter((pin) => pin !== word) });
    } else if (pinned.length < MAX_PINS) {
      update({ pins: [...pins, word] });
    }
  };

  const saveFavorite = (text: string, parts: string[]) => {
    add({ text, parts });
    setDraft("");
    update({
      keyword: undefined,
      pins: [
        ...new Set(parts.map((part) => normalizeKeyword(part)).filter(isWord)),
      ].slice(0, MAX_PINS),
    });
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
      <div className="flex flex-wrap gap-x-8 gap-y-4">
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
              placeholder="hydrogen"
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
                  onClick={() => {
                    removeKeyword();
                    wordInput.current?.focus();
                  }}
                >
                  <XMarkIcon className="size-5" />
                </IconButton>
              </span>
            )}
          </div>
          {unusableDraft && (
            <p className="text-sm text-slate-400">Use 2 to 12 letters.</p>
          )}
        </Field>
        <Field label={`Pinned words (up to ${MAX_PINS})`}>
          {pinned.length === 0 ? (
            <p className="max-w-78 text-sm text-slate-400">
              Save a word here for the next round of name generation.
            </p>
          ) : (
            <ul aria-label="Pinned words" className="flex flex-wrap gap-2">
              {pinned.map((word) => (
                <li
                  key={word}
                  className={`flex items-center gap-1 rounded-full py-0.5 pr-1
                    pl-3 text-sm ${PIN_CHIP_CLASSES}`}
                >
                  {word}
                  <IconButton
                    label={`Unpin ${word}`}
                    title={
                      word === keyword
                        ? "Unpin and clear the start word"
                        : "Unpin"
                    }
                    compact
                    onClick={() => {
                      togglePin(word);
                    }}
                  >
                    <XMarkIcon className="size-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </Field>
      </div>
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
            Nothing fits these words with these settings. Try another length or
            style.
          </p>
        ) : (
          <ul aria-label="Generated names" className={RESULTS_GRID_CLASSES}>
            {batch.map((name, index) => {
              const text = display(name);
              const favorite = has(text);

              return (
                <NameRow
                  key={name.id}
                  name={name}
                  display={text}
                  order={index}
                  animate={generation > 0}
                  favorite={favorite}
                  favoritesFull={full}
                  pinned={pinned}
                  onToggleFavorite={() => {
                    if (favorite) remove(text);
                    else saveFavorite(text, name.parts);
                  }}
                  onTogglePin={togglePin}
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
              {generateLabel(pinned)}
            </span>
          </Button>
        </div>
      </div>
      <FavoritesList
        favorites={favorites}
        pinned={pinned}
        onRemove={remove}
        onTogglePin={togglePin}
      />
    </section>
  );
};

export default NameGenerator;
