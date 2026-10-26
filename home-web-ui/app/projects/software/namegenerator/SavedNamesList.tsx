import { signInHref } from "@/app/auth/returnPath";
import { Favorite } from "@/app/projects/software/namegenerator/favorites";
import {
  CopyButton,
  IconButton,
  ListedName,
  PlaceholderSlot,
} from "@/app/projects/software/namegenerator/NameRow";
import { SavedNames } from "@/app/projects/software/namegenerator/savedNames";
import {
  LIST_BAR_CLASSES,
  NAME_GRID_CLASSES,
} from "@/app/projects/software/namegenerator/styles";
import Button from "@/app/ui/Button";
import type { SavedName } from "@home/shared";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { ReactNode, Ref, useEffect, useRef } from "react";

const PAGER_BUTTON_CLASSES =
  "shrink-0 rounded-md p-1 text-slate-400 hover:cursor-pointer hover:bg-slate-700 hover:text-slate-100 focus:outline-slate-100";

const UNAVAILABLE_PAGER_CLASSES =
  "cursor-default opacity-40 hover:bg-transparent hover:text-slate-400";

const PagerButton = ({
  label,
  unavailable,
  busy,
  ref,
  onClick,
  children,
}: {
  label: string;
  unavailable: boolean;
  busy: boolean;
  ref?: Ref<HTMLButtonElement>;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    ref={ref}
    type="button"
    aria-label={label}
    title={label}
    aria-disabled={unavailable || busy}
    onClick={() => {
      if (!unavailable && !busy) onClick();
    }}
    className={`${PAGER_BUTTON_CLASSES} ${
      unavailable ? UNAVAILABLE_PAGER_CLASSES : ""
    }`}
  >
    {children}
  </button>
);

const statusOf = (saved: SavedNames) => {
  if (!saved.active) {
    return saved.error ?? "Sign in to keep names in your account.";
  }
  if (saved.error !== undefined) return saved.error;
  if (saved.names === undefined) return "Loading saved names…";
  if (saved.total === 0)
    return "No saved names yet. Star a name, then save it.";
  return "";
};

const SavedNamesList = ({
  saved,
  returnTo,
  display,
  pinned,
  onTogglePin,
  onOpen,
}: {
  saved: SavedNames;
  returnTo: string;
  display: (name: Favorite) => string;
  pinned: readonly string[];
  onTogglePin: (word: string) => void;
  onOpen: (name: SavedName) => void;
}) => {
  const removeButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const previousButton = useRef<HTMLButtonElement>(null);
  const focusSlot = useRef<number>(undefined);
  const names = saved.names;

  useEffect(() => {
    const slot = focusSlot.current;
    if (slot === undefined) return;

    focusSlot.current = undefined;
    const filled = removeButtons.current.filter((button) => button !== null);
    (
      removeButtons.current[slot] ??
      filled[filled.length - 1] ??
      previousButton.current
    )?.focus();
  }, [names]);

  const status = statusOf(saved);
  const pager =
    saved.active &&
    names !== undefined &&
    saved.error === undefined &&
    saved.total !== 0;

  return (
    <div className="flex flex-col gap-3">
      <ul aria-label="Saved names" className={NAME_GRID_CLASSES}>
        {Array.from({ length: saved.pageSize }, (_, slot) => {
          const name = names?.[slot];

          if (name === undefined) return <PlaceholderSlot key={slot} />;

          const text = display(name);

          return (
            <ListedName
              key={name._id}
              name={name}
              display={text}
              ring="ring-sky-400/40"
              pinned={pinned}
              onTogglePin={onTogglePin}
              onOpen={() => {
                onOpen(name);
              }}
            >
              <CopyButton text={text} />
              <IconButton
                ref={(button) => {
                  removeButtons.current[slot] = button;
                }}
                label={`Remove ${text} from saved names`}
                title="Remove from saved names"
                busy={saved.pending}
                size="medium"
                onClick={() => {
                  focusSlot.current = slot;
                  saved.unsave(name);
                }}
              >
                <XMarkIcon className="size-5" />
              </IconButton>
            </ListedName>
          );
        })}
      </ul>
      <div className={LIST_BAR_CLASSES}>
        <p
          className={`min-w-0 flex-1 truncate ${
            saved.error === undefined ? "" : "text-amber-200"
          }`}
          title={status}
        >
          {status}
        </p>
        {!saved.active && (
          <Button
            type="link"
            size="small"
            linkProps={{ href: signInHref(returnTo) }}
          >
            Sign in
          </Button>
        )}
        {saved.active && saved.error !== undefined && (
          <Button type="button" size="small" onClick={saved.retry}>
            Try again
          </Button>
        )}
        {pager && (
          <>
            <span className="shrink-0 tabular-nums">
              Page {saved.page} of {saved.totalPages}
            </span>
            <PagerButton
              label="Previous page"
              unavailable={saved.page <= 1}
              busy={saved.loading}
              ref={previousButton}
              onClick={() => {
                saved.goTo(saved.page - 1);
              }}
            >
              <ChevronLeftIcon className="size-5" />
            </PagerButton>
            <PagerButton
              label="Next page"
              unavailable={saved.page >= saved.totalPages}
              busy={saved.loading}
              onClick={() => {
                saved.goTo(saved.page + 1);
              }}
            >
              <ChevronRightIcon className="size-5" />
            </PagerButton>
          </>
        )}
      </div>
    </div>
  );
};

export default SavedNamesList;
