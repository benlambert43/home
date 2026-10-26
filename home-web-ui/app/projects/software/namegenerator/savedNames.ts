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

type SavedNamesPage = {
  number: number;
  names: SavedName[];
  totalPages: number;
};

type SavedNamesData = {
  summary?: SavedNamesSummary;
  page?: SavedNamesPage;
  stale: boolean;
  savedIds: ReadonlyMap<string, string>;
  checked: ReadonlySet<string>;
  error?: string;
  signedOut: boolean;
};

const EMPTY: SavedNamesData = {
  stale: false,
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
  pageSize: number,
) => {
  const [data, setData] = useState(EMPTY);
  const [requested, setRequested] = useState(1);
  const [wasSignedIn, setWasSignedIn] = useState(signedIn);
  const [pending, startTransition] = useTransition();

  if (signedIn !== wasSignedIn) {
    setWasSignedIn(signedIn);
    setData(EMPTY);
    setRequested(1);
  }

  const active = signedIn && !data.signedOut;
  const loading =
    active &&
    wanted &&
    data.error === undefined &&
    (data.page === undefined || data.page.number !== requested || data.stale);

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
      const result = await request(getSavedNames(requested, pageSize));
      if (cancelled) return;

      if (!result.error && result.page > result.totalPages) {
        setRequested(result.totalPages);
        return;
      }

      setData((current) =>
        result.error
          ? failed(current, result)
          : {
              ...known(current, result, result.names),
              page: {
                number: result.page,
                names: result.names,
                totalPages: result.totalPages,
              },
              stale: false,
            },
      );
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [loading, requested, pageSize, data.stale]);

  const save = (name: Favorite) => {
    startTransition(async () => {
      const result = await request(
        saveName({ parts: name.parts, number: name.number }),
      );

      setData((current) =>
        result.error
          ? failed(current, result)
          : {
              ...known(current, result, [result.name]),
              stale: current.page !== undefined,
            },
      );
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

        return {
          ...current,
          summary: summaryOf(result),
          savedIds,
          error: undefined,
          stale: current.page !== undefined,
        };
      });
    });
  };

  const goTo = (page: number) => {
    setRequested(Math.max(1, page));
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
    pageSize,
    page: data.page?.number ?? 1,
    totalPages: data.page?.totalPages ?? 1,
    names: data.page?.names,
    idOf: (name: Favorite) => data.savedIds.get(favoriteKey(name)),
    save,
    unsave,
    goTo,
    retry,
  };
};

export type SavedNames = ReturnType<typeof useSavedNames>;
