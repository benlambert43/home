"use client";

import {
  ACCEPTED_POST_IMAGE_TYPES,
  pickedFiles,
} from "@/app/blog/postImageFiles";
import PostMarkdown, { PostMarkdownImage } from "@/app/blog/PostMarkdown";
import { useHydrated } from "@/app/lib/useHydrated";
import Button from "@/app/ui/Button";
import { FIELD_CLASSES, FIELD_WIDTHS } from "@/app/ui/fieldStyles";
import { normalizePostContent, postImageReference } from "@home/shared";
import {
  ChangeEvent,
  KeyboardEvent,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

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

const LINE_BREAK = "\\\n";

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
  { label: "H", title: "Heading", edit: prefixLines(() => "## ") },
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
  images = [],
  onAddImages,
  ref,
}: {
  name: string;
  label: string;
  rows: number;
  disabled?: boolean;
  defaultValue?: string;
  images?: PostMarkdownImage[];
  onAddImages?: (files: File[]) => Promise<string[]>;
  ref?: Ref<MarkdownEditorHandle>;
}) => {
  const [content, setContent] = useState(defaultValue);
  const [previewing, setPreviewing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pendingSelection = useRef<MarkdownSelection>(undefined);
  const mac = useHydrated() && /Mac|iPhone|iPad/.test(navigator.userAgent);

  useEffect(() => {
    const selection = pendingSelection.current;
    if (!selection || !textareaRef.current) return;

    pendingSelection.current = undefined;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(
      selection.selectionStart,
      selection.selectionEnd,
    );
  }, [content]);

  const apply = (edit: MarkdownEdit) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const next = edit({
      value: textarea.value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
    });

    pendingSelection.current = next;
    setContent(next.value);
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
    const item = TOOLBAR.find(
      ({ shortcut }) => shortcut && matchesShortcut(shortcut, event, mac),
    );

    if (!item) return;

    event.preventDefault();
    apply(item.edit);
  };

  return (
    <div className={FIELD_WIDTHS.wide.wrapper}>
      <label htmlFor={name}>{label}</label>

      <div
        className={`${FIELD_WIDTHS.wide.field} grid grid-cols-1 gap-2
          xl:max-w-324 xl:grid-cols-2 xl:gap-x-4`}
      >
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

          <div className="ml-auto flex flex-row gap-2 xl:hidden">
            <Button
              type="button"
              size="small"
              emphasis={previewing ? "secondary" : "primary"}
              onClick={() => {
                setPreviewing(false);
              }}
            >
              Write
            </Button>
            <Button
              type="button"
              size="small"
              emphasis={previewing ? "primary" : "secondary"}
              onClick={() => {
                setPreviewing(true);
              }}
            >
              Preview
            </Button>
          </div>
        </div>

        <textarea
          id={name}
          name={name}
          ref={textareaRef}
          rows={rows}
          disabled={disabled}
          value={content}
          placeholder={label}
          onChange={(event) => {
            setContent(event.target.value);
          }}
          onKeyDown={onKeyDown}
          className={`${previewing ? "hidden xl:block" : ""} w-full
            ${FIELD_CLASSES} font-mono xl:col-start-1`}
        />

        <div
          className={`${previewing ? "" : "hidden xl:block"} min-h-64
            overflow-x-auto ${FIELD_CLASSES} xl:col-start-2 xl:row-start-2`}
        >
          <PostMarkdown
            content={normalizePostContent(content)}
            images={images}
          />
        </div>
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
