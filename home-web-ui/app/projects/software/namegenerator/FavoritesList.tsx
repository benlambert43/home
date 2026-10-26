import {
  Favorite,
  favoriteKey,
  MAX_FAVORITES,
} from "@/app/projects/software/namegenerator/favorites";
import {
  CopyButton,
  IconButton,
  ListedName,
  PlaceholderSlot,
  SaveButton,
  SaveProps,
} from "@/app/projects/software/namegenerator/NameRow";
import {
  LIST_BAR_CLASSES,
  NAME_GRID_CLASSES,
} from "@/app/projects/software/namegenerator/styles";
import { XMarkIcon } from "@heroicons/react/16/solid";

const FavoritesList = ({
  favorites,
  display,
  pinned,
  error,
  saveProps,
  onRemove,
  onTogglePin,
  onOpen,
}: {
  favorites: readonly Favorite[];
  display: (favorite: Favorite) => string;
  pinned: readonly string[];
  error?: string;
  saveProps: (favorite: Favorite) => SaveProps | undefined;
  onRemove: (favorite: Favorite) => void;
  onTogglePin: (word: string) => void;
  onOpen: (favorite: Favorite) => void;
}) => (
  <div className="flex flex-col gap-3">
    <ul aria-label="Favorite names" className={NAME_GRID_CLASSES}>
      {Array.from({ length: MAX_FAVORITES }, (_, index) => {
        const favorite = favorites[index];

        if (favorite === undefined) return <PlaceholderSlot key={index} />;

        const text = display(favorite);
        const save = saveProps(favorite);

        return (
          <ListedName
            key={favoriteKey(favorite)}
            name={favorite}
            display={text}
            ring="ring-amber-400/40"
            saved={save?.saved}
            pinned={pinned}
            onTogglePin={onTogglePin}
            onOpen={() => {
              onOpen(favorite);
            }}
          >
            <CopyButton text={text} />
            {save !== undefined && <SaveButton {...save} display={text} />}
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
          </ListedName>
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

export default FavoritesList;
