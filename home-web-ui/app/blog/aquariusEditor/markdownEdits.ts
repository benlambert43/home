import { postImageReference } from "@home/shared";

export type EditorSelection = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export type MarkdownEdit = (selection: EditorSelection) => EditorSelection;

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

export const BOLD_MARKER = "**";

export const ITALIC_MARKER = "_";

export const CODE_MARKER = "`";

export const LINE_BREAK = "\\\n";

export const MAX_HEADING_LEVEL = 6;

const HORIZONTAL_RULE = "---";

const CODE_FENCE = "```";

const INDENT = "    ";

const TABLE_HEADER = "Column";

const LEADING_SPACE = /^[ \t]*/;

const QUOTE_PREFIX = /^(?:[ \t]*>[ \t]?)+/;

const ONE_QUOTE_LEVEL = /^[ \t]*>[ \t]?/;

const HEADING_PREFIX = /^[ \t]{0,3}(#{1,6})[ \t]+/;

const LIST_MARKER = /^([ \t]*)(?:[-*+]|\d+[.)])[ \t]+/;

const BULLET_MARKER = /^[ \t]*[-*+][ \t]+/;

const NUMBER_MARKER = /^[ \t]*\d+[.)][ \t]+/;

const LIST_ITEM = /^((?:[ \t]*>[ \t]?)*[ \t]*)([-*+]|(\d+)[.)])([ \t]+)(.*)$/;

const QUOTE_LINE = /^((?:[ \t]*>[ \t]?)+)(.*)$/;

const ONE_INDENT_LEVEL = /^(?: {1,4}|\t)/;

const TRAILING_INDENT_LEVEL = /(?: {4}|\t)$/;

const TOKEN_CHARACTER = /[\p{L}\p{N}'’-]/u;

const WHITESPACE = /\s/;

const WORD_LIKE = /[\p{L}\p{N}]/u;

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

export const lineStart = (value: string, index: number) =>
  index <= 0 ? 0 : value.lastIndexOf("\n", index - 1) + 1;

export const lineEnd = (value: string, index: number) => {
  const next = value.indexOf("\n", index);
  return next === -1 ? value.length : next;
};

const lineAt = (value: string, index: number) =>
  value.slice(lineStart(value, index), lineEnd(value, index));

const leadingSpace = (line: string) => LEADING_SPACE.exec(line)?.[0] ?? "";

const quotePrefix = (line: string) => QUOTE_PREFIX.exec(line)?.[0] ?? "";

const lineBody = (line: string) => line.slice(quotePrefix(line).length);

export const caretPosition = (value: string, index: number) => {
  const start = lineStart(value, index);

  return {
    line: value.slice(0, start).split("\n").length,
    column: index - start + 1,
  };
};

const selectedLineRange = ({
  value,
  selectionStart,
  selectionEnd,
}: EditorSelection) => {
  const end =
    selectionEnd > selectionStart && value.charAt(selectionEnd - 1) === "\n"
      ? selectionEnd - 1
      : selectionEnd;

  return { start: lineStart(value, selectionStart), end: lineEnd(value, end) };
};

const replaceLines = (
  selection: EditorSelection,
  transform: (lines: string[]) => string[],
): EditorSelection => {
  const { value, selectionStart, selectionEnd } = selection;
  const { start, end } = selectedLineRange(selection);
  const replaced = transform(value.slice(start, end).split("\n")).join("\n");
  const nextValue = `${value.slice(0, start)}${replaced}${value.slice(end)}`;

  if (selectionStart !== selectionEnd) {
    return {
      value: nextValue,
      selectionStart: start,
      selectionEnd: start + replaced.length,
    };
  }

  const caret = Math.min(
    start + replaced.length,
    Math.max(start, selectionStart + replaced.length - (end - start)),
  );

  return { value: nextValue, selectionStart: caret, selectionEnd: caret };
};

const tokenAt = (value: string, index: number) => {
  let start = index;
  let end = index;

  while (start > 0 && TOKEN_CHARACTER.test(value.charAt(start - 1))) start -= 1;
  while (end < value.length && TOKEN_CHARACTER.test(value.charAt(end)))
    end += 1;

  return start === end ? undefined : { start, end };
};

const wrappedOutside = (
  value: string,
  start: number,
  end: number,
  marker: string,
) =>
  start >= marker.length &&
  value.slice(start - marker.length, start) === marker &&
  value.slice(end, end + marker.length) === marker;

const wrappedInside = (selected: string, marker: string) =>
  selected.length >= 2 * marker.length &&
  selected.startsWith(marker) &&
  selected.endsWith(marker);

type MarkerSpan = { open: number; close: number };

const enclosingSpan = (
  line: string,
  from: number,
  to: number,
  marker: string,
): MarkerSpan | undefined => {
  let cursor = 0;

  while (cursor < line.length) {
    const open = line.indexOf(marker, cursor);
    if (open === -1) return undefined;

    const close = line.indexOf(marker, open + marker.length);
    if (close === -1) return undefined;

    if (from >= open + marker.length && to <= close) return { open, close };

    cursor = close + marker.length;
  }

  return undefined;
};

const spanAround = (
  value: string,
  start: number,
  end: number,
  marker: string,
) => {
  const from = lineStart(value, start);
  if (lineEnd(value, start) !== lineEnd(value, end)) return undefined;

  const span = enclosingSpan(
    value.slice(from, lineEnd(value, start)),
    start - from,
    end - from,
    marker,
  );

  return span && { open: from + span.open, close: from + span.close };
};

const rewrapped = (text: string, marker: string) => {
  const core = text.trim();
  if (!WORD_LIKE.test(core)) return text;

  const lead = text.length - text.trimStart().length;
  const trail = text.length - text.trimEnd().length;

  return `${text.slice(0, lead)}${marker}${core}${marker}${text.slice(text.length - trail)}`;
};

const unwrapWithin = (
  value: string,
  { open, close }: MarkerSpan,
  start: number,
  end: number,
  marker: string,
): EditorSelection => {
  const size = marker.length;
  const before = rewrapped(value.slice(open + size, start), marker);
  const selected = value.slice(start, end);
  const after = rewrapped(value.slice(end, close), marker);

  return {
    value: `${value.slice(0, open)}${before}${selected}${after}${value.slice(close + size)}`,
    selectionStart: open + before.length,
    selectionEnd: open + before.length + selected.length,
  };
};

export const toggleWrap =
  (marker: string): MarkdownEdit =>
  (selection) => {
    const { value } = selection;
    const size = marker.length;
    let { selectionStart: start, selectionEnd: end } = selection;

    if (start === end) {
      if (wrappedOutside(value, start, end, marker)) {
        return {
          value: `${value.slice(0, start - size)}${value.slice(end + size)}`,
          selectionStart: start - size,
          selectionEnd: start - size,
        };
      }

      const token = tokenAt(value, start);

      if (!token) {
        return {
          value: `${value.slice(0, start)}${marker}${marker}${value.slice(end)}`,
          selectionStart: start + size,
          selectionEnd: start + size,
        };
      }

      ({ start, end } = token);
    }

    while (start < end && WHITESPACE.test(value.charAt(start))) start += 1;
    while (end > start && WHITESPACE.test(value.charAt(end - 1))) end -= 1;

    const selected = value.slice(start, end);

    if (wrappedInside(selected, marker)) {
      const inner = selected.slice(size, -size);

      return {
        value: `${value.slice(0, start)}${inner}${value.slice(end)}`,
        selectionStart: start,
        selectionEnd: start + inner.length,
      };
    }

    if (wrappedOutside(value, start, end, marker)) {
      return {
        value: `${value.slice(0, start - size)}${selected}${value.slice(end + size)}`,
        selectionStart: start - size,
        selectionEnd: start - size + selected.length,
      };
    }

    const span = spanAround(value, start, end, marker);

    if (span) return unwrapWithin(value, span, start, end, marker);

    return {
      value: `${value.slice(0, start)}${marker}${selected}${marker}${value.slice(end)}`,
      selectionStart: start + size,
      selectionEnd: start + size + selected.length,
    };
  };

export const isWrapped = (
  value: string,
  start: number,
  end: number,
  marker: string,
) =>
  (start !== end &&
    (wrappedInside(value.slice(start, end), marker) ||
      wrappedOutside(value, start, end, marker))) ||
  spanAround(value, start, end, marker) !== undefined;

export const headingLevel = (value: string, index: number) =>
  HEADING_PREFIX.exec(lineBody(lineAt(value, index)))?.[1].length ?? 0;

export const setHeading =
  (level: number): MarkdownEdit =>
  (selection) =>
    replaceLines(selection, (lines) =>
      lines.map((line) => {
        const quote = quotePrefix(line);
        const text = line.slice(quote.length).replace(HEADING_PREFIX, "");

        return level === 0
          ? `${quote}${text}`
          : `${quote}${"#".repeat(level)} ${text.replace(LIST_MARKER, "")}`;
      }),
    );

const allLinesMatch = (lines: string[], pattern: RegExp) => {
  const items = lines.filter((line) => line.trim() !== "");

  return (
    items.length > 0 && items.every((line) => pattern.test(lineBody(line)))
  );
};

const withoutListMarker = (line: string) => {
  const quote = quotePrefix(line);

  return `${quote}${line.slice(quote.length).replace(LIST_MARKER, "$1")}`;
};

const withListMarker = (lines: string[], marker: (index: number) => string) =>
  lines.map((line, index) => {
    const stripped = withoutListMarker(line);
    const quote = quotePrefix(stripped);
    const indent = leadingSpace(stripped.slice(quote.length));
    const text = stripped.slice(quote.length + indent.length);

    return `${quote}${indent}${marker(index)}${text}`;
  });

export const isBulleted = (value: string, index: number) =>
  BULLET_MARKER.test(lineBody(lineAt(value, index)));

export const isNumbered = (value: string, index: number) =>
  NUMBER_MARKER.test(lineBody(lineAt(value, index)));

export const isQuoted = (value: string, index: number) =>
  QUOTE_PREFIX.test(lineAt(value, index));

export const isListItem = (value: string, index: number) =>
  LIST_ITEM.test(lineAt(value, index));

export const toggleBulletedList: MarkdownEdit = (selection) =>
  replaceLines(selection, (lines) =>
    allLinesMatch(lines, BULLET_MARKER)
      ? lines.map(withoutListMarker)
      : withListMarker(lines, () => "- "),
  );

export const toggleNumberedList: MarkdownEdit = (selection) =>
  replaceLines(selection, (lines) =>
    allLinesMatch(lines, NUMBER_MARKER)
      ? lines.map(withoutListMarker)
      : withListMarker(lines, (index) => `${index + 1}. `),
  );

export const toggleQuote: MarkdownEdit = (selection) =>
  replaceLines(selection, (lines) => {
    const items = lines.filter((line) => line.trim() !== "");
    const quoted =
      items.length > 0 && items.every((line) => QUOTE_PREFIX.test(line));

    return quoted
      ? lines.map((line) => line.replace(ONE_QUOTE_LEVEL, ""))
      : lines.map((line) => `> ${line}`);
  });

export const indentLines =
  (direction: 1 | -1): MarkdownEdit =>
  (selection) =>
    replaceLines(selection, (lines) =>
      lines.map((line) => {
        const quote = quotePrefix(line);
        const text = line.slice(quote.length);

        return direction === 1
          ? `${quote}${INDENT}${text}`
          : `${quote}${text.replace(ONE_INDENT_LEVEL, "")}`;
      }),
    );

type Continuation = {
  prefix: string;
  next: string;
  outdented?: string;
  content: string;
};

const continuation = (line: string): Continuation | undefined => {
  const item = LIST_ITEM.exec(line);

  if (item) {
    const [, lead, marker, number, spacing, content] = item;
    const nextMarker =
      typeof number === "string"
        ? `${Number(number) + 1}${marker.slice(number.length)}`
        : marker;
    const outdentedLead = lead.replace(TRAILING_INDENT_LEVEL, "");

    return {
      prefix: `${lead}${marker}${spacing}`,
      next: `${lead}${nextMarker}${spacing}`,
      outdented:
        outdentedLead === lead
          ? undefined
          : `${outdentedLead}${marker}${spacing}`,
      content,
    };
  }

  const quote = QUOTE_LINE.exec(line);

  if (quote) {
    const [, lead, content] = quote;

    return { prefix: lead, next: lead, content };
  }

  return undefined;
};

export const continueBlock = (
  selection: EditorSelection,
): EditorSelection | undefined => {
  const { value, selectionStart, selectionEnd } = selection;
  const start = lineStart(value, selectionStart);
  const end = lineEnd(value, selectionStart);
  const found = continuation(value.slice(start, end));

  if (!found || selectionStart - start < found.prefix.length) return undefined;

  const { next, outdented = "", content } = found;

  if (content === "" && selectionStart === selectionEnd) {
    const before = value.slice(0, start);
    const replacement =
      outdented !== "" || before === "" || before.endsWith("\n\n")
        ? outdented
        : "\n";
    const caret = start + replacement.length;

    return {
      value: `${before}${replacement}${value.slice(end)}`,
      selectionStart: caret,
      selectionEnd: caret,
    };
  }

  const caret = selectionStart + 1 + next.length;

  return {
    value: `${value.slice(0, selectionStart)}\n${next}${value.slice(selectionEnd)}`,
    selectionStart: caret,
    selectionEnd: caret,
  };
};

export const insertText =
  (text: string): MarkdownEdit =>
  ({ value, selectionStart, selectionEnd }) => {
    const caret = selectionStart + text.length;

    return {
      value: `${value.slice(0, selectionStart)}${text}${value.slice(selectionEnd)}`,
      selectionStart: caret,
      selectionEnd: caret,
    };
  };

const insertBlock =
  (block: string, cursor = block.length, cursorEnd = cursor): MarkdownEdit =>
  ({ value, selectionStart, selectionEnd }) => {
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const lead =
      before === "" || before.endsWith("\n\n")
        ? ""
        : before.endsWith("\n")
          ? "\n"
          : "\n\n";
    const tail = after.startsWith("\n\n")
      ? ""
      : after.startsWith("\n")
        ? "\n"
        : "\n\n";
    const offset = selectionStart + lead.length;

    return {
      value: `${before}${lead}${block}${tail}${after}`,
      selectionStart: offset + cursor,
      selectionEnd: offset + cursorEnd,
    };
  };

export const insertHorizontalRule = insertBlock(
  HORIZONTAL_RULE,
  HORIZONTAL_RULE.length + 1,
);

export const tableMarkdown = (columns: number, rows: number) => {
  const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const headers = Array.from(
    { length: columns },
    (_, index) => `${TABLE_HEADER} ${index + 1}`,
  );
  const body = Array.from({ length: Math.max(0, rows - 1) }, () =>
    row(Array.from({ length: columns }, () => " ")),
  );

  return [
    row(headers),
    row(Array.from({ length: columns }, () => "---")),
    ...body,
  ].join("\n");
};

export const insertTable = (columns: number, rows: number) =>
  insertBlock(tableMarkdown(columns, rows), 2, 2 + TABLE_HEADER.length + 2);

export const insertCodeBlock: MarkdownEdit = (selection) => {
  const { value } = selection;
  const { start, end } = selectedLineRange(selection);
  const selected = value.slice(start, end);
  const code = selected.trim() === "" ? "" : selected;
  const offset = start + CODE_FENCE.length + 1;

  return {
    value: `${value.slice(0, start)}${CODE_FENCE}\n${code}\n${CODE_FENCE}${value.slice(end)}`,
    selectionStart: offset,
    selectionEnd: offset + code.length,
  };
};

export const insertLink = (text: string, href: string) =>
  insertText(`[${text || href}](${href})`);

export const postImageMarkdown = (name: string) =>
  `![](${postImageReference(name)})`;

export const documentStatistics = (value: string) => ({
  words: value.split(/\s+/).filter((word) => word.length > 0).length,
  charactersWithoutSpaces: [...value.replace(/\s/g, "")].length,
  charactersWithSpaces: [...value.replace(/\n/g, "")].length,
  paragraphs: value.split(/\n[ \t]*\n/).filter((block) => block.trim() !== "")
    .length,
  lines: value.split("\n").filter((line) => line.trim() !== "").length,
});

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
