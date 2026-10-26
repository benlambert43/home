import {
  Favorite,
  favoriteKey,
  MAX_FAVORITES,
} from "@/app/projects/software/namegenerator/favorites";
import {
  CompactName,
  CopyButton,
  IconButton,
  WordChips,
} from "@/app/projects/software/namegenerator/NameRow";
import NameText from "@/app/projects/software/namegenerator/NameText";
import {
  FULL_NAME_CLASSES,
  NAME_GRID_CLASSES,
  NAME_TEXT_CLASSES,
  ROW_CLASSES,
  ROW_HEADER_CLASSES,
} from "@/app/projects/software/namegenerator/styles";
import { XMarkIcon } from "@heroicons/react/16/solid";

const FavoritesList = ({
  favorites,
  display,
  pinned,
  onRemove,
  onTogglePin,
  onOpen,
}: {
  favorites: readonly Favorite[];
  display: (favorite: Favorite) => string;
  pinned: readonly string[];
  onRemove: (favorite: Favorite) => void;
  onTogglePin: (word: string) => void;
  onOpen: (favorite: Favorite) => void;
}) => (
  <div className="flex flex-col gap-3 border-t border-slate-800 pt-6">
    <h2 className="text-xs font-medium tracking-wide text-slate-400 uppercase">
      Favorites ({favorites.length} of {MAX_FAVORITES})
    </h2>
    <ul aria-label="Favorite names" className={NAME_GRID_CLASSES}>
      {Array.from({ length: MAX_FAVORITES }, (_, index) => {
        const favorite = favorites[index];

        if (favorite === undefined) {
          return (
            <li
              key={index}
              aria-hidden
              className="min-h-9 rounded-xl border border-dashed
                border-slate-700 @md/generator:min-h-18.5"
            />
          );
        }

        const text = display(favorite);

        return (
          <li
            key={favoriteKey(favorite)}
            className={`${ROW_CLASSES} ring-amber-400/40`}
          >
            <CompactName
              name={favorite}
              display={text}
              onOpen={() => {
                onOpen(favorite);
              }}
            />
            <div className={FULL_NAME_CLASSES}>
              <div className={ROW_HEADER_CLASSES}>
                <code className={NAME_TEXT_CLASSES}>
                  <NameText text={text} parts={favorite.parts} />
                </code>
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
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);
export default FavoritesList;
