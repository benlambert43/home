"use client";

import {
  Favorite,
  favoriteKey,
  MAX_FAVORITES,
  useFavorites,
} from "@/app/projects/software/namegenerator/favorites";
import {
  CASES,
  DEFAULT_SETTINGS,
  DIGITS,
  FORMATS,
  GeneratorSettings,
  GeneratorState,
  generatorSearch,
  LENGTHS,
  MODES,
  parseGeneratorState,
  SEPARATORS,
  STYLES,
  THEMES,
} from "@/app/projects/software/namegenerator/generatorState";
import {
  CARD_CLASSES,
  CHIP_CLASSES,
  NAME_TEXT_CLASSES,
  PIN_CHIP_CLASSES,
  PLAIN_CHIP_CLASSES,
  RESULTS_GRID_CLASSES,
  ROW_CLASSES,
  ROW_HEADER_CLASSES,
  WORD_LIST_CLASSES,
} from "@/app/projects/software/namegenerator/styles";
import {
  formatProjectName,
  formatUsername,
  generateBatch,
  normalizeKeyword,
} from "@/app/projects/software/namegenerator/words/generateNames";
import { MAX_PINS } from "@/app/projects/software/namegenerator/words/LIMITS";
import { randomSeed } from "@/app/projects/software/namegenerator/words/random";
import { GeneratedName } from "@/app/projects/software/namegenerator/words/types";
import Button from "@/app/ui/Button";
import SegmentedToggle from "@/app/ui/SegmentedToggle";
import { FIELD_CLASSES } from "@/app/ui/fieldStyles";
import {
  ArrowPathIcon,
  CheckIcon,
  ChevronDownIcon,
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
  useId,
  useLayoutEffect,
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
  music: "Music",
  games: "Games",
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
  capital: "PascalCase",
  lower: "lowercase",
});

const COPIED_MS = 1500;

const isWord = (word: string | undefined): word is string => word !== undefined;

const PIN_LIST = new Intl.ListFormat("en", { type: "disjunction" });

const GenerateLabel = ({ pinned }: { pinned: readonly string[] }) => (
  <span>
    Generate
    {pinned.length > 0 && (
      <span className="hidden sm:inline">
        {` names from ${PIN_LIST.format(pinned)}`}
      </span>
    )}
  </span>
);

const FIELDS_GRID_CLASSES =
  "grid grid-cols-[repeat(auto-fill,minmax(min(22.375rem,100%),1fr))] gap-x-8 gap-y-5";

const FIELD_LABEL_CLASSES =
  "text-xs font-medium tracking-wide text-slate-400 uppercase";

const Field = ({
  label,
  expanded = false,
  onToggle,
  children,
}: {
  label: string;
  expanded?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}) => {
  const contentId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  const toggleTop = useRef<number>(undefined);

  useLayoutEffect(() => {
    const top = toggleTop.current;
    toggleTop.current = undefined;
    if (top === undefined || toggle.current === null) return;
    window.scrollBy(0, toggle.current.getBoundingClientRect().top - top);
  }, [expanded]);

  if (onToggle === undefined) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className={FIELD_LABEL_CLASSES}>{label}</span>
        {children}
      </div>
    );
  }
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <button
        ref={toggle}
        type="button"
        aria-expanded={expanded}
        aria-controls={contentId}
        onClick={(event) => {
          toggleTop.current = event.currentTarget.getBoundingClientRect().top;
          onToggle();
        }}
        className={`flex items-center justify-between gap-2 text-left
          hover:text-slate-200 sm:hidden ${FIELD_LABEL_CLASSES}`}
      >
        {label}
        <ChevronDownIcon
          className={`size-4 shrink-0 transition-transform
            ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <span className={`hidden sm:block ${FIELD_LABEL_CLASSES}`}>{label}</span>
      <div
        id={contentId}
        className={`${expanded ? "flex" : "hidden"} min-w-0 flex-col sm:flex`}
      >
        {children}
      </div>
    </div>
  );
};

const ICON_BUTTON_PADDING = {
  compact: "p-1 max-sm:p-0.5",
  small: "p-1",
  medium: "p-1.5",
  large: "p-2",
};

const IconButton = ({
  label,
  title,
  disabled = false,
  size = "large",
  onClick,
  children,
}: {
  label: string;
  title: string;
  disabled?: boolean;
  size?: keyof typeof ICON_BUTTON_PADDING;
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
      disabled:hover:text-slate-400 ${ICON_BUTTON_PADDING[size]}`}
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
      size="medium"
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
    className={`${CHIP_CLASSES} hover:cursor-pointer focus:outline-slate-100
      disabled:cursor-default disabled:opacity-40 ${
        pinned
          ? PIN_CHIP_CLASSES
          : `${PLAIN_CHIP_CLASSES} hover:bg-slate-600 hover:text-slate-50`
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
  <ul aria-label={label} className={WORD_LIST_CLASSES}>
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
    <div className={ROW_HEADER_CLASSES}>
      <code className={NAME_TEXT_CLASSES}>{display}</code>
      <span className="-ml-1.5 flex shrink-0 items-center">
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
          size="medium"
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
  display,
  pinned,
  onRemove,
  onTogglePin,
}: {
  favorites: readonly Favorite[];
  display: (favorite: Favorite) => string;
  pinned: readonly string[];
  onRemove: (favorite: Favorite) => void;
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
              className="min-h-18.5 rounded-xl border border-dashed
                border-slate-700"
            />
          );
        }

        const text = display(favorite);

        return (
          <li
            key={favoriteKey(favorite)}
            className={`${ROW_CLASSES} flex flex-col ring-amber-400/40`}
          >
            <div className={ROW_HEADER_CLASSES}>
              <code className={NAME_TEXT_CLASSES}>{text}</code>
              <span className="-ml-1.5 flex shrink-0 items-center">
                <CopyButton text={text} />
                <IconButton
                  label={`Remove ${text} from favorites`}
                  title="Remove from favorites"
                  size="medium"
                  onClick={() => {
                    onRemove(favorite);
                  }}
                >
                  <XMarkIcon className="size-5" />
                </IconButton>
              </span>
            </div>
            <WordChips
              label={`Words in ${text}`}
              parts={favorite.parts}
              pinned={pinned}
              onTogglePin={onTogglePin}
            />
          </li>
        );
      })}
    </ul>
  </div>
);

const NameGenerator = ({ params }: { params: Record<string, string> }) => {
  const pathname = usePathname();
  const [state, setState] = useState(() =>
    parseGeneratorState(params, randomSeed()),
  );
  const [draft, setDraft] = useState(state.keyword ?? "");
  const [generation, setGeneration] = useState(0);
  const wordInput = useRef<HTMLInputElement>(null);
  const [openField, setOpenField] = useState<string>();
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

  const fieldProps = (label: string) => ({
    label,
    expanded: openField === label,
    onToggle: () => {
      setOpenField((open) => (open === label ? undefined : label));
    },
  });

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

  const saveFavorite = ({ parts, number }: Favorite) => {
    add({ parts, number });
    setDraft("");
    update({
      keyword: undefined,
      pins: [
        ...new Set(parts.map((part) => normalizeKeyword(part)).filter(isWord)),
      ].slice(0, MAX_PINS),
    });
  };

  const atDefaults =
    draft === "" &&
    generatorSearch({ ...state, seed: "" }) ===
      generatorSearch({ ...DEFAULT_SETTINGS, seed: "" });

  const reset = () => {
    setDraft("");
    setOpenField(undefined);
    update({ ...DEFAULT_SETTINGS, keyword: undefined, seed: randomSeed() });
  };

  const display = (name: Favorite) =>
    mode === "project"
      ? formatProjectName(name, format)
      : formatUsername(name, { separator, digits, casing });

  return (
    <section
      aria-label="Name generator"
      className={`${CARD_CLASSES} pt-9 sm:pt-10`}
    >
      <span className="absolute top-1 right-1 sm:top-2 sm:right-2">
        <IconButton
          label="Reset settings"
          title="Reset settings (keeps favorites)"
          disabled={atDefaults}
          size="small"
          onClick={reset}
        >
          <span className="block px-1 text-xs">Reset</span>
        </IconButton>
      </span>
      <div className={FIELDS_GRID_CLASSES}>
        <Field {...fieldProps("Name type")}>
          <SegmentedToggle
            label="Name type"
            options={MODE_OPTIONS}
            value={mode}
            fill
            onChange={change("mode")}
          />
        </Field>
        <Field {...fieldProps("Start from a word (optional)")}>
          <div className="relative w-full">
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
              className={`w-full pr-10 max-sm:py-1.5 max-sm:pr-8 max-sm:pl-3
                ${FIELD_CLASSES}`}
            />
            {draft !== "" && (
              <span
                className="absolute inset-y-0 right-2.5 flex items-center
                  max-sm:right-1.5"
              >
                <IconButton
                  label="Clear the word"
                  title="Clear"
                  size="small"
                  onClick={() => {
                    removeKeyword();
                    wordInput.current?.focus();
                  }}
                >
                  <XMarkIcon className="size-4 max-sm:size-3.5" />
                </IconButton>
              </span>
            )}
          </div>
        </Field>
        <Field label={`Pinned words (up to ${MAX_PINS})`}>
          <ul
            aria-label="Pinned words"
            className="flex min-h-7 flex-wrap gap-2 [overflow-anchor:none]
              max-sm:min-h-5 max-sm:gap-1.5"
          >
            {pinned.length === 0 && (
              <li
                className="flex items-center rounded-full px-3 py-1 text-sm
                  text-slate-500 outline-1 outline-slate-600 outline-dashed
                  max-sm:px-2.5 max-sm:py-0.5 max-sm:text-xs"
              >
                None
              </li>
            )}
            {pinned.map((word) => (
              <li
                key={word}
                className={`flex items-center gap-1 rounded-full py-0.5 pr-1
                pl-3 text-sm max-sm:gap-0.5 max-sm:pr-0.5 max-sm:pl-2
                max-sm:text-xs ${PIN_CHIP_CLASSES}`}
              >
                {word}
                <IconButton
                  label={`Unpin ${word}`}
                  title={
                    word === keyword
                      ? "Unpin and clear the start word"
                      : "Unpin"
                  }
                  size="compact"
                  onClick={() => {
                    togglePin(word);
                  }}
                >
                  <XMarkIcon className="size-4 max-sm:size-3" />
                </IconButton>
              </li>
            ))}
          </ul>
        </Field>
        <Field {...fieldProps("Length")}>
          <SegmentedToggle
            label="Length"
            options={LENGTH_OPTIONS}
            value={length}
            fill
            onChange={change("length")}
          />
        </Field>
        <Field {...fieldProps("Theme")}>
          <SegmentedToggle
            label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            fill
            onChange={change("theme")}
          />
        </Field>
        {mode === "project" ? (
          <>
            <Field {...fieldProps("Style")}>
              <SegmentedToggle
                label="Style"
                options={STYLE_OPTIONS}
                value={style}
                fill
                onChange={change("style")}
              />
            </Field>
            <Field {...fieldProps("Format")}>
              <SegmentedToggle
                label="Format"
                options={FORMAT_OPTIONS}
                value={format}
                fill
                onChange={change("format")}
              />
            </Field>
          </>
        ) : (
          <>
            <Field {...fieldProps("Separator")}>
              <SegmentedToggle
                label="Separator"
                options={SEPARATOR_OPTIONS}
                value={separator}
                fill
                onChange={change("separator")}
              />
            </Field>
            <Field {...fieldProps("Digits")}>
              <SegmentedToggle
                label="Digits"
                options={DIGIT_OPTIONS}
                value={digits}
                fill
                onChange={change("digits")}
              />
            </Field>
            <Field {...fieldProps("Case")}>
              <SegmentedToggle
                label="Case"
                options={CASE_OPTIONS}
                value={casing}
                fill
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
              const favorite = has(name);

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
                    if (favorite) remove(name);
                    else saveFavorite(name);
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
              <GenerateLabel pinned={pinned} />
            </span>
          </Button>
        </div>
      </div>
      <FavoritesList
        favorites={favorites}
        display={display}
        pinned={pinned}
        onRemove={remove}
        onTogglePin={togglePin}
      />
    </section>
  );
};

export default NameGenerator;
