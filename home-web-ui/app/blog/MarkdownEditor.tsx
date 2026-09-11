"use client";

import PostMarkdown from "@/app/blog/PostMarkdown";
import Button from "@/app/ui/Button";
import { FIELD_CLASSES, FIELD_WIDTHS } from "@/app/ui/fieldStyles";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

type MarkdownSelection = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

type MarkdownEdit = (selection: MarkdownSelection) => MarkdownSelection;

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

const TOOLBAR: { label: string; title: string; edit: MarkdownEdit }[] = [
  { label: "B", title: "Bold", edit: wrapSelection("**", "bold text") },
  { label: "I", title: "Italic", edit: wrapSelection("_", "italic text") },
  { label: "</>", title: "Code", edit: wrapSelection("`", "code") },
  { label: "Link", title: "Link", edit: insertLink },
  { label: "H", title: "Heading", edit: prefixLines(() => "## ") },
  { label: "Quote", title: "Quote", edit: prefixLines(() => "> ") },
  { label: "List", title: "Bulleted list", edit: prefixLines(() => "- ") },
  {
    label: "1.",
    title: "Numbered list",
    edit: prefixLines((line) => `${line + 1}. `),
  },
  { label: "Block", title: "Code block", edit: fenceSelection("code") },
];

const SHORTCUTS: Record<string, MarkdownEdit> = {
  b: wrapSelection("**", "bold text"),
  i: wrapSelection("_", "italic text"),
  k: insertLink,
};

const MarkdownEditor = ({
  name,
  label,
  rows,
  defaultValue = "",
}: {
  name: string;
  label: string;
  rows: number;
  defaultValue?: string;
}) => {
  const [content, setContent] = useState(defaultValue);
  const [previewing, setPreviewing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<MarkdownSelection>(undefined);

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

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.metaKey && !event.ctrlKey) return;

    const shortcut = SHORTCUTS[event.key.toLowerCase()];
    if (!shortcut) return;

    event.preventDefault();
    apply(shortcut);
  };

  return (
    <div className={FIELD_WIDTHS.wide.wrapper}>
      <label htmlFor={name}>{label}</label>

      <div
        className={`${FIELD_WIDTHS.wide.field} flex flex-row flex-wrap
          items-center gap-2`}
      >
        {TOOLBAR.map((item) => (
          <Button
            key={item.title}
            type="button"
            size="small"
            emphasis="secondary"
            onClick={() => {
              apply(item.edit);
            }}
          >
            <span title={item.title}>{item.label}</span>
          </Button>
        ))}

        <div className="ml-auto flex flex-row gap-2">
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
        hidden={previewing}
        value={content}
        placeholder={label}
        onChange={(event) => {
          setContent(event.target.value);
        }}
        onKeyDown={onKeyDown}
        className={`${FIELD_WIDTHS.wide.field} ${FIELD_CLASSES} font-mono`}
      />

      {previewing && (
        <div
          className={`${FIELD_WIDTHS.wide.field} ${FIELD_CLASSES} min-h-64
          overflow-x-auto`}
        >
          <PostMarkdown content={content} />
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
