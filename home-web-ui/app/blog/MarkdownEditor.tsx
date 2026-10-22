"use client";

import {
  ACCEPTED_POST_IMAGE_TYPES,
  pickedFiles,
} from "@/app/blog/postImageFiles";
import { useHydrated } from "@/app/lib/useHydrated";
import Button from "@/app/ui/Button";
import { FIELD_CLASSES, FIELD_WIDTHS } from "@/app/ui/fieldStyles";
import { MAX_POST_HEADING_DEPTH, postImageReference } from "@home/shared";
import {
  ChangeEvent,
  KeyboardEvent,
  Ref,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

export type EditorMode = "write" | "preview";

export const EDITOR_MODES: { value: EditorMode; label: string }[] = [
  { value: "write", label: "Write" },
  { value: "preview", label: "Preview" },
];

export type MarkdownEditorHandle = { insert: (markdown: string) => void };

export const postImageMarkdown = (name: string) =>
  `![](${postImageReference(name)})`;

type MarkdownSelection = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

type MarkdownEdit = (selection: MarkdownSelection) => MarkdownSelection;

type Shortcut = { key: string; mod?: boolean; shift?: boolean };

type MarkdownChange = { before: MarkdownSelection; after: MarkdownSelection };

type MarkdownHistory = { undo: MarkdownChange[]; redo: MarkdownChange[] };

const LINE_BREAK = "\\\n";

const MAX_HISTORY_CHANGES = 100;

const UNDO_SHORTCUT: Shortcut = { key: "Z", mod: true };

const REDO_SHORTCUT: Shortcut = { key: "Z", mod: true, shift: true };

const REDO_SHORTCUT_CTRL_Y: Shortcut = { key: "Y", mod: true };

const PHYSICAL_KEYS: Partial<Record<string, string>> = {
  Digit7: "7",
  Digit8: "8",
  Period: ".",
};

const pressedKey = (event: KeyboardEvent) =>
  PHYSICAL_KEYS[event.code] ?? event.key.toLowerCase();

const matchesShortcut = (
  { key, mod = false, shift = false }: Shortcut,
  event: KeyboardEvent,
  mac: boolean,
) =>
  (mac ? event.metaKey : event.ctrlKey) === mod &&
  event.shiftKey === shift &&
  !event.altKey &&
  pressedKey(event) === key.toLowerCase();

const formatShortcut = ({ key, mod, shift }: Shortcut, mac: boolean) =>
  mac
    ? `${shift ? "⇧" : ""}${mod ? "⌘" : ""}${key === "Enter" ? "↩" : key}`
    : [mod && "Ctrl", shift && "Shift", key].filter(Boolean).join("+");

const redoShortcuts = (mac: boolean) =>
  mac ? [REDO_SHORTCUT] : [REDO_SHORTCUT, REDO_SHORTCUT_CTRL_Y];

const selectionOf = (textarea: HTMLTextAreaElement): MarkdownSelection => ({
  value: textarea.value,
  selectionStart: textarea.selectionStart,
  selectionEnd: textarea.selectionEnd,
});

const selectRange = (
  textarea: HTMLTextAreaElement,
  { selectionStart, selectionEnd }: MarkdownSelection,
) => {
  textarea.focus();
  textarea.setSelectionRange(selectionStart, selectionEnd);
};

const pushChange = (changes: MarkdownChange[], change: MarkdownChange) => {
  changes.push(change);
  if (changes.length > MAX_HISTORY_CHANGES) changes.shift();
};

const unlessNativeHistory = (
  textarea: HTMLTextAreaElement,
  fallback: () => void,
) => {
  const { value } = textarea;

  window.setTimeout(() => {
    if (textarea.value === value) fallback();
  }, 0);
};

const lineStart = (value: string, index: number) =>
  value.lastIndexOf("\n", index - 1) + 1;

const lineEnd = (value: string, index: number) => {
  const next = value.indexOf("\n", index);
  return next === -1 ? value.length : next;
};

const wrapSelection =
  (marker: string, placeholder: string): MarkdownEdit =>
  ({ value, selectionStart, selectionEnd }) => {
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const opening = selectionStart + marker.length;

    return {
      value: `${value.slice(0, selectionStart)}${marker}${selected}${marker}${value.slice(selectionEnd)}`,
      selectionStart: opening,
      selectionEnd: opening + selected.length,
    };
  };

const prefixLines =
  (prefix: (line: number) => string): MarkdownEdit =>
  ({ value, selectionStart, selectionEnd }) => {
    const start = lineStart(value, selectionStart);
    const end = lineEnd(value, selectionEnd);
    const prefixed = value
      .slice(start, end)
      .split("\n")
      .map((line, index) => `${prefix(index)}${line}`)
      .join("\n");

    return {
      value: `${value.slice(0, start)}${prefixed}${value.slice(end)}`,
      selectionStart: start,
      selectionEnd: start + prefixed.length,
    };
  };

const HEADING_PREFIX = /^(#{1,6}) /;

const cycleHeading: MarkdownEdit = ({
  value,
  selectionStart,
  selectionEnd,
}) => {
  const start = lineStart(value, selectionStart);
  const end = lineEnd(value, selectionEnd);
  const lines = value.slice(start, end).split("\n");
  const depth = HEADING_PREFIX.exec(lines[0] ?? "")?.[1]?.length ?? 0;
  const next = depth >= MAX_POST_HEADING_DEPTH ? 0 : depth + 1;
  const prefix = next === 0 ? "" : `${"#".repeat(next)} `;
  const headed = lines
    .map((line) => `${prefix}${line.replace(HEADING_PREFIX, "")}`)
    .join("\n");

  return {
    value: `${value.slice(0, start)}${headed}${value.slice(end)}`,
    selectionStart: start,
    selectionEnd: start + headed.length,
  };
};

const fenceSelection =
  (placeholder: string): MarkdownEdit =>
  ({ value, selectionStart, selectionEnd }) => {
    const start = lineStart(value, selectionStart);
    const end = lineEnd(value, selectionEnd);
    const selected = value.slice(start, end) || placeholder;
    const before = start === 0 ? "" : "\n";
    const opening = start + before.length + "```\n".length;

    return {
      value: `${value.slice(0, start)}${before}\`\`\`\n${selected}\n\`\`\`${value.slice(end)}`,
      selectionStart: opening,
      selectionEnd: opening + selected.length,
    };
  };

const insertLink: MarkdownEdit = ({ value, selectionStart, selectionEnd }) => {
  const selected = value.slice(selectionStart, selectionEnd) || "link text";
  const href = "https://";
  const opening = `[${selected}](`;
  const cursor = selectionStart + opening.length;

  return {
    value: `${value.slice(0, selectionStart)}${opening}${href})${value.slice(selectionEnd)}`,
    selectionStart: cursor,
    selectionEnd: cursor + href.length,
  };
};

const insertLineBreak: MarkdownEdit = ({
  value,
  selectionStart,
  selectionEnd,
}) => {
  const cursor = selectionStart + LINE_BREAK.length;

  return {
    value: `${value.slice(0, selectionStart)}${LINE_BREAK}${value.slice(selectionEnd)}`,
    selectionStart: cursor,
    selectionEnd: cursor,
  };
};

const insertMarkdown =
  (markdown: string): MarkdownEdit =>
  ({ value, selectionStart, selectionEnd }) => {
    const cursor = selectionStart + markdown.length;

    return {
      value: `${value.slice(0, selectionStart)}${markdown}${value.slice(selectionEnd)}`,
      selectionStart: cursor,
      selectionEnd: cursor,
    };
  };

const TOOLBAR: {
  label: string;
  title: string;
  edit: MarkdownEdit;
  shortcut?: Shortcut;
}[] = [
  {
    label: "B",
    title: "Bold",
    edit: wrapSelection("**", "bold text"),
    shortcut: { key: "B", mod: true },
  },
  {
    label: "I",
    title: "Italic",
    edit: wrapSelection("_", "italic text"),
    shortcut: { key: "I", mod: true },
  },
  {
    label: "</>",
    title: "Code",
    edit: wrapSelection("`", "code"),
    shortcut: { key: "E", mod: true },
  },
  {
    label: "Link",
    title: "Link",
    edit: insertLink,
    shortcut: { key: "K", mod: true },
  },
  {
    label: "Break",
    title: "Line break",
    edit: insertLineBreak,
    shortcut: { key: "Enter", shift: true },
  },
  { label: "H", title: "Heading (#, ##, ###)", edit: cycleHeading },
  {
    label: "Quote",
    title: "Quote",
    edit: prefixLines(() => "> "),
    shortcut: { key: ".", mod: true, shift: true },
  },
  {
    label: "List",
    title: "Bulleted list",
    edit: prefixLines(() => "- "),
    shortcut: { key: "8", mod: true, shift: true },
  },
  {
    label: "1.",
    title: "Numbered list",
    edit: prefixLines((line) => `${line + 1}. `),
    shortcut: { key: "7", mod: true, shift: true },
  },
  { label: "Block", title: "Code block", edit: fenceSelection("code") },
];

const MarkdownEditor = ({
  name,
  label,
  rows,
  disabled = false,
  defaultValue = "",
  onAddImages,
  ref,
}: {
  name: string;
  label: string;
  rows: number;
  disabled?: boolean;
  defaultValue?: string;
  onAddImages?: (files: File[]) => Promise<string[]>;
  ref?: Ref<MarkdownEditorHandle>;
}) => {
  const id = useId();
  const [content, setContent] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const history = useRef<MarkdownHistory>({ undo: [], redo: [] });
  const mac = useHydrated() && /Mac|iPhone|iPad/.test(navigator.userAgent);

  const restore = (
    textarea: HTMLTextAreaElement,
    selection: MarkdownSelection,
  ) => {
    if (selection.value !== textarea.value) {
      flushSync(() => {
        setContent(selection.value);
      });
    }

    selectRange(textarea, selection);
  };

  const apply = (edit: MarkdownEdit) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const before = selectionOf(textarea);
    const after = edit(before);

    if (after.value !== before.value) {
      pushChange(history.current.undo, { before, after });
      history.current.redo = [];
    }

    restore(textarea, after);
  };

  const undo = () => {
    const textarea = textareaRef.current;
    const change = history.current.undo.at(-1);
    if (!textarea || !change) return;

    const current = selectionOf(textarea);

    if (current.value === change.after.value) {
      history.current.undo.pop();
      pushChange(history.current.redo, change);
      restore(textarea, change.before);
      return;
    }

    pushChange(history.current.redo, { before: change.after, after: current });
    restore(textarea, change.after);
  };

  const redo = () => {
    const textarea = textareaRef.current;
    const change = history.current.redo.at(-1);
    if (!textarea || !change || textarea.value !== change.before.value) return;

    history.current.redo.pop();
    pushChange(history.current.undo, change);
    restore(textarea, change.after);
  };

  useImperativeHandle(ref, () => ({
    insert: (markdown: string) => {
      apply(insertMarkdown(markdown));
    },
  }));

  const addImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = pickedFiles(event);
    const names = files.length > 0 ? await onAddImages?.(files) : undefined;

    if (names?.length) {
      apply(insertMarkdown(names.map(postImageMarkdown).join("\n")));
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (matchesShortcut(UNDO_SHORTCUT, event, mac)) {
      unlessNativeHistory(event.currentTarget, undo);
      return;
    }

    if (
      redoShortcuts(mac).some((shortcut) =>
        matchesShortcut(shortcut, event, mac),
      )
    ) {
      unlessNativeHistory(event.currentTarget, redo);
      return;
    }

    const item = TOOLBAR.find(
      ({ shortcut }) => shortcut && matchesShortcut(shortcut, event, mac),
    );

    if (!item) return;

    event.preventDefault();
    apply(item.edit);
  };

  return (
    <div className={FIELD_WIDTHS.full.wrapper}>
      <label htmlFor={id}>{label}</label>

      <div className={`${FIELD_WIDTHS.full.field} grid grid-cols-1 gap-2`}>
        <div className="flex flex-row flex-wrap items-center gap-2">
          {TOOLBAR.map((item) => (
            <Button
              key={item.title}
              type="button"
              size="small"
              emphasis="secondary"
              disabled={disabled}
              title={
                item.shortcut
                  ? `${item.title} (${formatShortcut(item.shortcut, mac)})`
                  : item.title
              }
              onClick={() => {
                apply(item.edit);
              }}
            >
              {item.label}
            </Button>
          ))}

          {onAddImages && (
            <Button
              type="button"
              size="small"
              emphasis="secondary"
              disabled={disabled}
              title="Image"
              onClick={() => {
                imageInputRef.current?.click();
              }}
            >
              Image
            </Button>
          )}
        </div>

        <textarea
          id={id}
          name={name}
          ref={textareaRef}
          rows={rows}
          disabled={disabled}
          value={content}
          placeholder={label}
          onChange={(event) => {
            history.current.redo = [];
            setContent(event.target.value);
          }}
          onKeyDown={onKeyDown}
          className={`w-full ${FIELD_CLASSES} font-mono`}
        />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        multiple
        hidden
        accept={ACCEPTED_POST_IMAGE_TYPES}
        onChange={(event) => {
          void addImages(event);
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
