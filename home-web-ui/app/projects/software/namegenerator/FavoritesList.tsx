import {
  Favorite,
  favoriteKey,
  MAX_FAVORITES,
} from "@/app/projects/software/namegenerator/favorites";
import NameRow, {
  NameDetailsProps,
  PlaceholderSlot,
} from "@/app/projects/software/namegenerator/NameRow";
import {
  LIST_BAR_CLASSES,
  NAME_GRID_CLASSES,
} from "@/app/projects/software/namegenerator/styles";
import { useEffect, useRef } from "react";

const FavoritesList = ({
  favorites,
  error,
  detailsProps,
  onOpen,
}: {
  favorites: readonly Favorite[];
  error?: string;
  detailsProps: (favorite: Favorite) => NameDetailsProps;
  onOpen: (favorite: Favorite) => void;
}) => {
  const list = useRef<HTMLUListElement>(null);
  const stars = useRef<(HTMLButtonElement | null)[]>([]);
  const focusSlot = useRef<number>(undefined);

  useEffect(() => {
    const slot = focusSlot.current;
    if (slot === undefined) return;

    focusSlot.current = undefined;
    const filled = stars.current.filter((button) => button !== null);
    (stars.current[slot] ?? filled[filled.length - 1] ?? list.current)?.focus();
  }, [favorites]);

  return (
    <div className="flex flex-col gap-3">
      <ul
        ref={list}
        tabIndex={-1}
        aria-label="Favorite names"
        className={`${NAME_GRID_CLASSES} outline-none`}
      >
        {Array.from({ length: MAX_FAVORITES }, (_, slot) => {
          const favorite = favorites[slot];
          if (favorite === undefined) return <PlaceholderSlot key={slot} />;

          const details = detailsProps(favorite);

          return (
            <NameRow
              key={favoriteKey(favorite)}
              {...details}
              favoriteRef={(button) => {
                stars.current[slot] = button;
              }}
              onToggleFavorite={() => {
                focusSlot.current = slot;
                details.onToggleFavorite();
              }}
              ring="ring-amber-400/40"
              onOpen={() => {
                onOpen(favorite);
              }}
            />
          );
        })}
      </ul>
      <div className={LIST_BAR_CLASSES}>
        <p className="min-w-0 flex-1 truncate text-amber-200" title={error}>
          {error}
        </p>
      </div>
    </div>
  );
};

export default FavoritesList;
