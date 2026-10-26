import { signInHref } from "@/app/auth/returnPath";
import { Favorite } from "@/app/projects/software/namegenerator/favorites";
import {
  CopyButton,
  IconButton,
  ListedName,
} from "@/app/projects/software/namegenerator/NameRow";
import { SavedNames } from "@/app/projects/software/namegenerator/savedNames";
import { NAME_GRID_CLASSES } from "@/app/projects/software/namegenerator/styles";
import Button from "@/app/ui/Button";
import type { SavedName } from "@home/shared";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { ReactNode } from "react";

const Notice = ({ text, children }: { text: string; children?: ReactNode }) => (
  <div className="flex flex-col items-start gap-3">
    <p className="text-sm text-slate-300">{text}</p>
    {children}
  </div>
);

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
  if (!saved.active) {
    return (
      <Notice text={saved.error ?? "Sign in to keep names in your account."}>
        <Button
          type="link"
          size="small"
          linkProps={{ href: signInHref(returnTo) }}
        >
          Sign in
        </Button>
      </Notice>
    );
  }

  if (saved.names === undefined) {
    return saved.error === undefined ? (
      <Notice text="Loading saved names…" />
    ) : (
      <Notice text={saved.error}>
        <Button type="button" size="small" onClick={saved.retry}>
          Try again
        </Button>
      </Notice>
    );
  }

  if (saved.names.length === 0) {
    return <Notice text="No saved names yet. Star a name, then save it." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <ul aria-label="Saved names" className={NAME_GRID_CLASSES}>
        {saved.names.map((name) => {
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
                label={`Remove ${text} from saved names`}
                title="Remove from saved names"
                disabled={saved.pending}
                size="medium"
                onClick={() => {
                  saved.unsave(name);
                }}
              >
                <XMarkIcon className="size-5" />
              </IconButton>
            </ListedName>
          );
        })}
      </ul>
      {saved.error !== undefined && (
        <p className="text-sm text-amber-200">{saved.error}</p>
      )}
      {saved.hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            size="small"
            emphasis="secondary"
            disabled={saved.pending}
            onClick={saved.loadMore}
          >
            {saved.pending ? "Loading…" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SavedNamesList;
