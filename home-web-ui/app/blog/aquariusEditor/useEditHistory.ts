import { EditorSelection } from "@/app/blog/aquariusEditor/markdownEdits";
import { useState } from "react";

export type HistoryKind = "insert" | "delete" | "edit";

type Entry = EditorSelection & { kind: HistoryKind; at: number };

type History = { past: Entry[]; present: Entry; future: Entry[] };

const MAX_UNDO = 100;

const TYPING_GROUP_MS = 1000;

const entry = (
  selection: EditorSelection,
  kind: HistoryKind,
  at: number,
): Entry => ({ ...selection, kind, at });

const restored = (selection: EditorSelection) => entry(selection, "edit", 0);

const recorded = (
  { past, present }: History,
  next: EditorSelection,
  kind: HistoryKind,
  at: number,
): History => {
  const grouped =
    kind !== "edit" &&
    present.kind === kind &&
    at - present.at < TYPING_GROUP_MS;

  return {
    past: grouped ? past : [...past, present].slice(-MAX_UNDO),
    present: entry(next, kind, at),
    future: [],
  };
};

const undone = ({ past, present, future }: History): History | undefined => {
  const previous = past.at(-1);

  return (
    previous && {
      past: past.slice(0, -1),
      present: restored(previous),
      future: [present, ...future],
    }
  );
};

const redone = ({ past, present, future }: History): History | undefined => {
  const [next, ...rest] = future;

  return (
    next && {
      past: [...past, present],
      present: restored(next),
      future: rest,
    }
  );
};

export const useEditHistory = (initialValue: string) => {
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: restored({
      value: initialValue,
      selectionStart: 0,
      selectionEnd: 0,
    }),
    future: [],
  }));

  const record = (next: EditorSelection, kind: HistoryKind, at: number) => {
    setHistory(recorded(history, next, kind, at));
  };

  const undo = (): EditorSelection | undefined => {
    const next = undone(history);
    if (next) setHistory(next);
    return next?.present;
  };

  const redo = (): EditorSelection | undefined => {
    const next = redone(history);
    if (next) setHistory(next);
    return next?.present;
  };

  return {
    value: history.present.value,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    record,
    undo,
    redo,
  };
};
