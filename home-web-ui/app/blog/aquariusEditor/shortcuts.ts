export type Shortcut = {
  key: string;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
};

type ShortcutEvent = {
  code: string;
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
};

const PHYSICAL_KEYS: Partial<Record<string, string>> = {
  Digit0: "0",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Period: ".",
};

const MAC_KEY_LABELS: Partial<Record<string, string>> = {
  Enter: "↩",
  Tab: "⇥",
};

const pressedKey = (event: ShortcutEvent) =>
  PHYSICAL_KEYS[event.code] ?? event.key.toLowerCase();

export const matchesShortcut = (
  { key, mod = false, shift = false, alt = false }: Shortcut,
  event: ShortcutEvent,
  mac: boolean,
) =>
  (mac ? event.metaKey : event.ctrlKey) === mod &&
  event.shiftKey === shift &&
  event.altKey === alt &&
  pressedKey(event) === key.toLowerCase();

export const formatShortcut = (
  { key, mod, shift, alt }: Shortcut,
  mac: boolean,
) => {
  const label = key.length === 1 ? key.toUpperCase() : key;

  return mac
    ? `${alt ? "⌥" : ""}${shift ? "⇧" : ""}${mod ? "⌘" : ""}${MAC_KEY_LABELS[key] ?? label}`
    : [mod && "Ctrl", alt && "Alt", shift && "Shift", label]
        .filter(Boolean)
        .join("+");
};
