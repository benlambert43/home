import {
  getSavedNames,
  lookupSavedNames,
  removeSavedName,
  saveName,
  SavedNamesFailure,
} from "@/app/actions/savedNames";
import { SERVICE_UNAVAILABLE_MESSAGE } from "@/app/lib/messages";
import {
  Favorite,
  favoriteKey,
} from "@/app/projects/software/namegenerator/favorites";
import type { SavedName, SavedNamesSummary } from "@home/shared";
import { useEffect, useState, useTransition } from "react";

type SavedNamesList = { names: SavedName[]; nextCursor: string | null };

type SavedNamesData = {
  summary?: SavedNamesSummary;
  list?: SavedNamesList;
  savedIds: ReadonlyMap<string, string>;
  checked: ReadonlySet<string>;
  error?: string;
  signedOut: boolean;
};

const EMPTY: SavedNamesData = {
  savedIds: new Map(),
  checked: new Set(),
  signedOut: false,
};

const UNREACHABLE: SavedNamesFailure = {
  error: true,
  message: SERVICE_UNAVAILABLE_MESSAGE,
  signedOut: false,
};

const request = async <Result>(
  action: Promise<Result | SavedNamesFailure>,
): Promise<Result | SavedNamesFailure> => {
  try {
    return await action;
  } catch {
    return UNREACHABLE;
  }
};

const summaryOf = ({ total, limit }: SavedNamesSummary) => ({ total, limit });

const known = (
  data: SavedNamesData,
  summary: SavedNamesSummary,
  names: readonly SavedName[],
  checkedKeys: readonly string[] = [],
): SavedNamesData => {
  const savedIds = new Map(data.savedIds);
  const checked = new Set([...data.checked, ...checkedKeys]);

  for (const name of names) {
    savedIds.set(favoriteKey(name), name._id);
    checked.add(favoriteKey(name));
  }

  return {
    ...data,
    summary: summaryOf(summary),
    savedIds,
    checked,
    error: undefined,
  };
};

const failed = (
  data: SavedNamesData,
  failure: SavedNamesFailure,
): SavedNamesData => ({
  ...data,
  error: failure.message,
  signedOut: failure.signedOut,
});

export const useSavedNames = (
  signedIn: boolean,
  favorites: readonly Favorite[],
  wanted: boolean,
) => {
  const [data, setData] = useState(EMPTY);
  const [wasSignedIn, setWasSignedIn] = useState(signedIn);
  const [pending, startTransition] = useTransition();

  if (signedIn !== wasSignedIn) {
    setWasSignedIn(signedIn);
    setData(EMPTY);
  }

  const active = signedIn && !data.signedOut;
  const loading =
    active && wanted && data.list === undefined && data.error === undefined;

  useEffect(() => {
    const unchecked = favorites.filter(
      (favorite) => !data.checked.has(favoriteKey(favorite)),
    );
    if (!active || unchecked.length === 0) return;

    let cancelled = false;

    const lookup = async () => {
      const result = await request(
        lookupSavedNames({ names: unchecked.map(({ parts }) => ({ parts })) }),
      );
      if (cancelled) return;

      setData((current) => {
        if (!result.error) {
          return known(
            current,
            result,
            result.names,
            unchecked.map(favoriteKey),
          );
        }
        return result.signedOut ? failed(current, result) : current;
      });
    };

    void lookup();

    return () => {
      cancelled = true;
    };
  }, [active, favorites, data.checked]);

  useEffect(() => {
    if (!loading) return;

    let cancelled = false;

    const load = async () => {
      const result = await request(getSavedNames());
      if (cancelled) return;

      setData((current) =>
        result.error
          ? failed(current, result)
          : {
              ...known(current, result, result.names),
              list: { names: result.names, nextCursor: result.nextCursor },
            },
      );
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [loading]);

  const save = (name: Favorite) => {
    startTransition(async () => {
      const result = await request(
        saveName({ parts: name.parts, number: name.number }),
      );

      setData((current) => {
        if (result.error) return failed(current, result);

        const next = known(current, result, [result.name]);
        const list = current.list;
        if (list === undefined || !result.created) return next;

        return {
          ...next,
          list: { ...list, names: [result.name, ...list.names] },
        };
      });
    });
  };

  const unsave = (name: Favorite) => {
    const key = favoriteKey(name);
    const id = data.savedIds.get(key);
    if (id === undefined) return;

    startTransition(async () => {
      const result = await request(removeSavedName(id));

      setData((current) => {
        if (result.error) return failed(current, result);

        const savedIds = new Map(current.savedIds);
        savedIds.delete(key);
        const list = current.list && {
          ...current.list,
          names: current.list.names.filter((saved) => saved._id !== id),
        };

        return {
          ...current,
          summary: summaryOf(result),
          savedIds,
          list,
          error: undefined,
        };
      });
    });
  };

  const loadMore = () => {
    const cursor = data.list?.nextCursor;
    if (!cursor) return;

    startTransition(async () => {
      const result = await request(getSavedNames(cursor));

      setData((current) => {
        if (result.error) return failed(current, result);

        const names = [...(current.list?.names ?? []), ...result.names];

        return {
          ...known(current, result, result.names),
          list: { names, nextCursor: result.nextCursor },
        };
      });
    });
  };

  const retry = () => {
    setData((current) => ({ ...current, error: undefined }));
  };

  return {
    active,
    loading,
    pending,
    error: data.error,
    total: data.summary?.total,
    full:
      data.summary !== undefined && data.summary.total >= data.summary.limit,
    names: data.list?.names,
    hasMore: Boolean(data.list?.nextCursor),
    idOf: (name: Favorite) => data.savedIds.get(favoriteKey(name)),
    save,
    unsave,
    loadMore,
    retry,
  };
};

export type SavedNames = ReturnType<typeof useSavedNames>;
