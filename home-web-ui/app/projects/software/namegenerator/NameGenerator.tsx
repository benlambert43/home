"use client";

import Dialog from "@/app/components/Dialog";
import { SessionContext } from "@/app/components/SessionProvider";
import {
  Favorite,
  MAX_FAVORITES,
  useFavorites,
} from "@/app/projects/software/namegenerator/favorites";
import FavoritesList from "@/app/projects/software/namegenerator/FavoritesList";
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
import NameRow, {
  IconButton,
  NameDetails,
  NameDetailsProps,
  SaveProps,
} from "@/app/projects/software/namegenerator/NameRow";
import { useSavedNames } from "@/app/projects/software/namegenerator/savedNames";
import SavedNamesList from "@/app/projects/software/namegenerator/SavedNamesList";
import {
  CARD_CLASSES,
  NAME_GRID_CLASSES,
  PIN_CHIP_CLASSES,
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
import Tabs, { TabOption } from "@/app/ui/Tabs";
import { FIELD_CLASSES } from "@/app/ui/fieldStyles";
import {
  ArrowPathIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { usePathname } from "next/navigation";
import {
  ReactNode,
  useContext,
  useMemo,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type Option<T extends string> = { value: T; label: string };

type NameListTab = "favorites" | "saved";

const labelled = <T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): Option<T>[] => values.map((value) => ({ value, label: labels[value] }));

const optionLabel = <T extends string>(options: Option<T>[], value: T) =>
  options.find((option) => option.value === value)?.label ?? value;

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

const GENERATING_SETTINGS: ReadonlySet<keyof GeneratorSettings> = new Set([
  "mode",
  "style",
  "length",
  "theme",
]);

const isWord = (word: string | undefined): word is string => word !== undefined;

const shuffleOrder = (parts: readonly string[]) => {
  const original = parts.join(" ");
  let next = [...parts];
  while (next.join(" ") === original) {
    next = [...parts];
    for (let index = next.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [next[index], next[swap]] = [next[swap], next[index]];
    }
  }
  return next;
};

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
  summary,
  expanded = false,
  onToggle,
  children,
}: {
  label: string;
  summary?: string;
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
          hover:cursor-pointer hover:text-slate-200 sm:hidden
          ${FIELD_LABEL_CLASSES}`}
      >
        <span
          className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5"
        >
          {label}
          {summary !== undefined && (
            <span
              className="max-w-full truncate text-xs font-normal tracking-normal
                text-slate-300 normal-case"
            >
              {summary}
            </span>
          )}
        </span>
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
const NameGenerator = ({ params }: { params: Record<string, string> }) => {
  const pathname = usePathname();
  const [state, setState] = useState(() =>
    parseGeneratorState(params, randomSeed()),
  );
  const [draft, setDraft] = useState(state.keyword ?? "");
  const [source, setSource] = useState(() => ({
    keyword: state.keyword,
    pins: state.pins,
  }));
  const [generation, setGeneration] = useState(0);
  const wordInput = useRef<HTMLInputElement>(null);
  const generateRow = useRef<HTMLDivElement>(null);
  const generateTop = useRef<number>(undefined);
  const [openField, setOpenField] = useState<string>();
  const [selected, setSelected] = useState<Favorite | GeneratedName>();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { favorites, has, add, remove, full } = useFavorites();
  const session = useContext(SessionContext);
  const [tab, setTab] = useState<NameListTab>("favorites");
  const saved = useSavedNames(
    session?.signedIn ?? false,
    favorites,
    tab === "saved",
  );

  const { mode, style, length, theme, keyword, pins, seed } = state;
  const { format, separator, digits, casing } = state;
  const pinKey = source.pins.join(",");
  const pinned = keyword === undefined ? pins : [keyword, ...pins];
  const returnTo = `${pathname}${generatorSearch({ ...state, ...source })}`;

  const batch = useMemo(
    () =>
      generateBatch(
        {
          mode,
          style,
          length,
          theme,
          keyword: source.keyword,
          pins: pinKey === "" ? [] : pinKey.split(","),
        },
        seed,
      ),
    [mode, style, length, theme, source.keyword, pinKey, seed],
  );

  const [orders, setOrders] = useState<{
    batch: GeneratedName[];
    parts: Partial<Record<string, string[]>>;
  }>({ batch, parts: {} });
  const shuffledParts = orders.batch === batch ? orders.parts : {};
  const names = batch.map((name) => ({
    ...name,
    parts: shuffledParts[name.id] ?? name.parts,
  }));

  const shuffle = (name: GeneratedName) => {
    const parts = shuffleOrder(name.parts);
    setOrders({ batch, parts: { ...shuffledParts, [name.id]: parts } });
    setSelected((current) =>
      current !== undefined && "id" in current && current.id === name.id
        ? { ...name, parts }
        : current,
    );
  };

  useLayoutEffect(() => {
    const top = generateTop.current;
    generateTop.current = undefined;
    if (top === undefined || generateRow.current === null) return;
    window.scrollBy(0, generateRow.current.getBoundingClientRect().top - top);
  }, [seed]);

  const update = (changes: Partial<GeneratorState>, regenerate = true) => {
    const next = { ...state, ...changes };
    const generated = regenerate
      ? { keyword: next.keyword, pins: next.pins }
      : source;
    setState(next);
    if (regenerate) {
      setSource(generated);
      setGeneration((count) => count + 1);
    }
    window.history.replaceState(
      null,
      "",
      `${pathname}${generatorSearch({ ...next, ...generated })}`,
    );
  };

  const change =
    <Key extends keyof GeneratorSettings>(key: Key) =>
    (value: GeneratorSettings[Key]) => {
      update({ [key]: value }, GENERATING_SETTINGS.has(key));
    };

  const fieldProps = (label: string, summary: string) => ({
    label,
    summary,
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

  const removeKeyword = (regenerate = true) => {
    setDraft("");
    if (keyword !== undefined) update({ keyword: undefined }, regenerate);
  };

  const togglePin = (word: string) => {
    if (word === keyword) {
      removeKeyword(false);
    } else if (pins.includes(word)) {
      update({ pins: pins.filter((pin) => pin !== word) }, false);
    } else if (pinned.length < MAX_PINS) {
      update({ pins: [...pins, word] }, false);
    }
  };

  const saveFavorite = ({ parts, number }: Favorite) => {
    add({ parts, number });
    setDraft("");
    update(
      {
        keyword: undefined,
        pins: [
          ...new Set(
            parts.map((part) => normalizeKeyword(part)).filter(isWord),
          ),
        ].slice(0, MAX_PINS),
      },
      false,
    );
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

  const saveProps = (name: Favorite): SaveProps | undefined => {
    const id = saved.idOf(name);
    if (!saved.active || (!has(name) && id === undefined)) return undefined;

    return {
      saved: id !== undefined,
      full: saved.full,
      pending: saved.pending,
      onToggle: () => {
        if (id === undefined) saved.save(name);
        else saved.unsave(name);
      },
    };
  };

  const nameListTabs: TabOption<NameListTab>[] = [
    {
      value: "favorites",
      label: `Favorites (${favorites.length} of ${MAX_FAVORITES})`,
    },
    {
      value: "saved",
      label:
        saved.total === undefined
          ? "Saved"
          : `Saved (${saved.total.toLocaleString("en-US")})`,
    },
  ];

  const detailsProps = (name: Favorite | GeneratedName): NameDetailsProps => {
    const favorite = has(name);
    return {
      name,
      display: display(name),
      favorite,
      favoritesFull: full,
      save: saveProps(name),
      pinned,
      onToggleFavorite: () => {
        if (favorite) remove(name);
        else saveFavorite(name);
      },
      onTogglePin: togglePin,
      onShuffle:
        "id" in name
          ? () => {
              shuffle(name);
            }
          : undefined,
    };
  };

  const openDetails = (name: Favorite | GeneratedName) => {
    setSelected(name);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
  };

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
        <Field {...fieldProps("Name type", optionLabel(MODE_OPTIONS, mode))}>
          <SegmentedToggle
            label="Name type"
            options={MODE_OPTIONS}
            value={mode}
            fill
            onChange={change("mode")}
          />
        </Field>
        <Field {...fieldProps("Starting word", keyword ?? "None")}>
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
              aria-label="Starting word"
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
        <Field label="Pinned">
          <ul
            aria-label="Pinned words"
            className="flex min-h-7 flex-wrap gap-2 [overflow-anchor:none]
              max-sm:gap-1.5"
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
        <Field {...fieldProps("Length", optionLabel(LENGTH_OPTIONS, length))}>
          <SegmentedToggle
            label="Length"
            options={LENGTH_OPTIONS}
            value={length}
            fill
            onChange={change("length")}
          />
        </Field>
        <Field {...fieldProps("Theme", optionLabel(THEME_OPTIONS, theme))}>
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
            <Field {...fieldProps("Style", optionLabel(STYLE_OPTIONS, style))}>
              <SegmentedToggle
                label="Style"
                options={STYLE_OPTIONS}
                value={style}
                fill
                onChange={change("style")}
              />
            </Field>
            <Field
              {...fieldProps("Format", optionLabel(FORMAT_OPTIONS, format))}
            >
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
            <Field
              {...fieldProps(
                "Separator",
                optionLabel(SEPARATOR_OPTIONS, separator),
              )}
            >
              <SegmentedToggle
                label="Separator"
                options={SEPARATOR_OPTIONS}
                value={separator}
                fill
                onChange={change("separator")}
              />
            </Field>
            <Field
              {...fieldProps("Digits", optionLabel(DIGIT_OPTIONS, digits))}
            >
              <SegmentedToggle
                label="Digits"
                options={DIGIT_OPTIONS}
                value={digits}
                fill
                onChange={change("digits")}
              />
            </Field>
            <Field {...fieldProps("Case", optionLabel(CASE_OPTIONS, casing))}>
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
        {names.length === 0 ? (
          <p className="text-slate-300">
            Nothing fits these words with these settings. Try another length or
            style.
          </p>
        ) : (
          <ul aria-label="Generated names" className={NAME_GRID_CLASSES}>
            {names.map((name, index) => (
              <NameRow
                key={name.id}
                {...detailsProps(name)}
                order={index}
                animate={generation > 0}
                onOpen={() => {
                  openDetails(name);
                }}
              />
            ))}
          </ul>
        )}
        <div ref={generateRow} className="flex justify-center">
          <Button
            type="button"
            size="large"
            onClick={() => {
              generateTop.current =
                generateRow.current?.getBoundingClientRect().top;
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
      <div className="border-t border-slate-800 pt-6">
        <Tabs
          label="Name lists"
          tabs={nameListTabs}
          value={tab}
          onChange={setTab}
        >
          {tab === "favorites" ? (
            <FavoritesList
              favorites={favorites}
              display={display}
              pinned={pinned}
              error={saved.error}
              saveProps={saveProps}
              onRemove={remove}
              onTogglePin={togglePin}
              onOpen={openDetails}
            />
          ) : (
            <SavedNamesList
              saved={saved}
              returnTo={returnTo}
              display={display}
              pinned={pinned}
              onTogglePin={togglePin}
              onOpen={openDetails}
            />
          )}
        </Tabs>
      </div>
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        label={selected === undefined ? undefined : display(selected)}
      >
        {selected !== undefined && (
          <div
            className={`@container flex w-full max-w-sm flex-col rounded-xl
            bg-slate-800 p-3 shadow-xl ring-1 ring-slate-700`}
          >
            <NameDetails {...detailsProps(selected)} stacked>
              <IconButton
                label="Close"
                title="Close"
                size="medium"
                onClick={closeDetails}
              >
                <XMarkIcon className="size-5" />
              </IconButton>
            </NameDetails>
          </div>
        )}
      </Dialog>
    </section>
  );
};

export default NameGenerator;
