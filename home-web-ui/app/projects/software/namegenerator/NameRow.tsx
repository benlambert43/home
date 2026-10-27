import {
  Favorite,
  MAX_FAVORITES,
} from "@/app/projects/software/namegenerator/favorites";
import NameText from "@/app/projects/software/namegenerator/NameText";
import {
  CHIP_CLASSES,
  FULL_NAME_CLASSES,
  NAME_TEXT_CLASSES,
  PIN_CHIP_CLASSES,
  PLAIN_CHIP_CLASSES,
  ROW_CLASSES,
  ROW_HEADER_CLASSES,
  ROW_PADDING_CLASSES,
  WORD_LIST_CLASSES,
} from "@/app/projects/software/namegenerator/styles";
import { MAX_PINS } from "@/app/projects/software/namegenerator/words/LIMITS";
import {
  ArrowsRightLeftIcon,
  BookmarkIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  StarIcon,
} from "@heroicons/react/16/solid";
import {
  CSSProperties,
  ReactNode,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";

const COPIED_MS = 1500;

const ICON_BUTTON_PADDING = {
  compact: "p-1 max-sm:rounded-full max-sm:p-1.5",
  small: "p-1",
  medium: "p-1.5",
  large: "p-2",
};

type IconButtonSize = keyof typeof ICON_BUTTON_PADDING;

export const IconButton = ({
  label,
  title,
  disabled = false,
  busy = false,
  size = "large",
  ref,
  onClick,
  children,
}: {
  label: string;
  title: string;
  disabled?: boolean;
  busy?: boolean;
  size?: IconButtonSize;
  ref?: Ref<HTMLButtonElement>;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={title}
    disabled={disabled}
    aria-disabled={busy || undefined}
    onClick={() => {
      if (!busy) onClick();
    }}
    className={`shrink-0 rounded-md text-slate-400 hover:cursor-pointer
      hover:bg-slate-700 hover:text-slate-100 focus:outline-slate-100
      disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent
      disabled:hover:text-slate-400 ${ICON_BUTTON_PADDING[size]}`}
  >
    {children}
  </button>
);

export const CopyButton = ({
  text,
  size = "medium",
}: {
  text: string;
  size?: IconButtonSize;
}) => {
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
      size={size}
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

export type SaveProps = {
  saved: boolean;
  full: boolean;
  pending: boolean;
  ref?: Ref<HTMLButtonElement>;
  onToggle: () => void;
};

export const SaveButton = ({
  display,
  saved,
  full,
  pending,
  ref,
  onToggle,
  size = "medium",
}: SaveProps & { display: string; size?: IconButtonSize }) => (
  <IconButton
    ref={ref}
    label={
      saved
        ? `Remove ${display} from saved names`
        : `Save ${display} to your account`
    }
    title={
      saved
        ? "Remove from saved names"
        : full
          ? "Saved names are full"
          : "Save to your account"
    }
    disabled={!saved && full}
    busy={pending}
    size={size}
    onClick={onToggle}
  >
    <BookmarkIcon className={`size-5 ${saved ? "text-sky-400" : ""}`} />
  </IconButton>
);

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

export const WordChips = ({
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
      <li key={word} className="flex">
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

export type NameDetailsProps = {
  name: Favorite;
  display: string;
  favorite: boolean;
  favoritesFull: boolean;
  save?: SaveProps;
  favoriteRef?: Ref<HTMLButtonElement>;
  pinned: readonly string[];
  onToggleFavorite: () => void;
  onTogglePin: (word: string) => void;
  onShuffle?: () => void;
};

export const NameDetails = ({
  name,
  display,
  favorite,
  favoritesFull,
  save,
  favoriteRef,
  pinned,
  onToggleFavorite,
  onTogglePin,
  onShuffle,
  stacked = false,
  children,
}: NameDetailsProps & { stacked?: boolean; children?: ReactNode }) => {
  const size = stacked ? "medium" : "small";

  const actions = (
    <span
      className={`flex shrink-0 items-center ${
        stacked ? "-mx-1.5 -mt-1.5 self-stretch" : "-ml-1.5"
      }`}
    >
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
        size={size}
        ref={favoriteRef}
        onClick={onToggleFavorite}
      >
        <StarIcon className={`size-5 ${favorite ? "text-amber-400" : ""}`} />
      </IconButton>
      {save !== undefined && (
        <SaveButton {...save} display={display} size={size} />
      )}
      <CopyButton text={display} size={size} />
      {onShuffle !== undefined && new Set(name.parts).size > 1 && (
        <IconButton
          label={`Shuffle the word order of ${display}`}
          title="Shuffle word order"
          size={size}
          onClick={onShuffle}
        >
          <ArrowsRightLeftIcon className="size-5" />
        </IconButton>
      )}
      {stacked ? <span className="ml-auto flex">{children}</span> : children}
    </span>
  );

  return (
    <>
      {stacked && actions}
      <div className={ROW_HEADER_CLASSES}>
        <code className={NAME_TEXT_CLASSES}>
          <NameText text={display} parts={name.parts} />
        </code>
        {!stacked && actions}
      </div>
      <WordChips
        label={`Words in ${display}`}
        parts={name.parts}
        pinned={pinned}
        onTogglePin={onTogglePin}
      />
    </>
  );
};

export const CompactName = ({
  name,
  display,
  favorite = false,
  saved = false,
  onOpen,
}: {
  name: Favorite;
  display: string;
  favorite?: boolean;
  saved?: boolean;
  onOpen: () => void;
}) => (
  <button
    type="button"
    aria-haspopup="dialog"
    onClick={onOpen}
    className={`${ROW_PADDING_CLASSES} flex size-full items-start gap-1
      rounded-xl text-left hover:cursor-pointer hover:bg-slate-700/60
      focus:outline-slate-100 @md/generator:hidden`}
  >
    <code className={NAME_TEXT_CLASSES}>
      <NameText text={display} parts={name.parts} />
    </code>
    {favorite && (
      <>
        <StarIcon className="mt-0.5 size-4 shrink-0 text-amber-400" />
        <span className="sr-only">, favorite</span>
      </>
    )}
    {saved && (
      <>
        <BookmarkIcon className="mt-0.5 size-4 shrink-0 text-sky-400" />
        <span className="sr-only">, saved</span>
      </>
    )}
  </button>
);

const NameRow = ({
  ring = "ring-slate-700/80",
  order = 0,
  animate = false,
  onOpen,
  ...details
}: NameDetailsProps & {
  ring?: string;
  order?: number;
  animate?: boolean;
  onOpen: () => void;
}) => (
  <li
    className={`${ROW_CLASSES} ${ring} ${
      animate ? "animated:motion-safe:animate-rise" : ""
    }`}
    style={{ "--rise-order": order * 0.4 } as CSSProperties}
  >
    <CompactName
      name={details.name}
      display={details.display}
      favorite={details.favorite}
      saved={details.save?.saved}
      onOpen={onOpen}
    />
    <div className={FULL_NAME_CLASSES}>
      <NameDetails {...details} />
    </div>
  </li>
);
export const PlaceholderSlot = () => (
  <li
    aria-hidden
    className="@container rounded-xl outline-1 -outline-offset-1
      outline-slate-700 outline-dashed"
  >
    <div className="min-h-9 @3xs:min-h-10 @xs:min-h-11 @md/generator:min-h-18.5" />
  </li>
);

export default NameRow;
