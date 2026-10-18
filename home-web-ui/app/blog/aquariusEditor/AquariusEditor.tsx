"use client";

import "@/app/blog/aquariusEditor/aquariusEditor.css";
import {
  LinkDialog,
  StatisticsDialog,
  TableDialog,
} from "@/app/blog/aquariusEditor/AquariusDialogs";
import AquariusHelp from "@/app/blog/aquariusEditor/AquariusHelp";
import {
  BulletedListIcon,
  CodeBlockIcon,
  CopyIcon,
  CutIcon,
  OutdentIcon,
  HelpIcon,
  HorizontalLineIcon,
  LinkIcon,
  IndentIcon,
  NumberedListIcon,
  PasteIcon,
  ImageIcon,
  RedoIcon,
  PostIcon,
  TableIcon,
  UndoIcon,
} from "@/app/blog/aquariusEditor/AquariusIcons";
import AquariusMenuBar, {
  AquariusMenu,
  MENU_SEPARATOR,
} from "@/app/blog/aquariusEditor/AquariusMenuBar";
import AquariusStatusBar from "@/app/blog/aquariusEditor/AquariusStatusBar";
import AquariusToolbar, {
  TOOLBAR_SEPARATOR,
  ToolbarItem,
} from "@/app/blog/aquariusEditor/AquariusToolbar";
import {
  BOLD_MARKER,
  caretPosition,
  CODE_MARKER,
  continueBlock,
  documentStatistics,
  EditorSelection,
  formatShortcut,
  headingLevel,
  indentLines,
  insertCodeBlock,
  insertHorizontalRule,
  insertLink,
  insertTable,
  insertText,
  isBulleted,
  isListItem,
  isNumbered,
  isQuoted,
  isWrapped,
  ITALIC_MARKER,
  LINE_BREAK,
  MarkdownEdit,
  matchesShortcut,
  MAX_HEADING_LEVEL,
  postImageMarkdown,
  setHeading,
  Shortcut,
  toggleBulletedList,
  toggleNumberedList,
  toggleQuote,
  toggleWrap,
} from "@/app/blog/aquariusEditor/markdownEdits";
import {
  HistoryKind,
  useEditHistory,
} from "@/app/blog/aquariusEditor/useEditHistory";
import {
  ACCEPTED_POST_IMAGE_TYPES,
  pickedFiles,
} from "@/app/blog/postImageFiles";
import { useHydrated } from "@/app/lib/useHydrated";
import {
  ChangeEvent,
  KeyboardEvent,
  Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type AquariusEditorHandle = { insert: (markdown: string) => void };

const APPLICATION_NAME = "benlambertdottech aquarius";

const UNTITLED_POST = "Untitled post";

const PIXELS_PER_INCH = 96;

const PAGE_WIDTH = 8.5 * PIXELS_PER_INCH;

const PAGE_HEIGHT = 11 * PIXELS_PER_INCH;

const PAGE_MARGIN = PIXELS_PER_INCH;

const PAGE_GUTTER = 24;

const PAGE_EDGE = 4;

const FULL_WIDTH_MARGIN = 16;

const MIN_PAGE_SCALE = 0.25;

const CHROME_TOP = 64;

const DOCUMENT_TEXT_CLASSES =
  "w-full border-0 bg-transparent p-0 font-(family-name:--font-document) text-[16px] leading-tight whitespace-pre-wrap wrap-break-word text-black outline-none";

type Zoom = "2" | "1.5" | "1" | "0.75" | "0.5" | "page";

type View = "page" | "fullWidth";

type Field = "title" | "content";

type Selection = { start: number; end: number };

type Dialog =
  { kind: "link"; text: string } | { kind: "table" } | { kind: "statistics" };

const ZOOM_OPTIONS: { value: Zoom; label: string }[] = [
  { value: "2", label: "200%" },
  { value: "1.5", label: "150%" },
  { value: "1", label: "100%" },
  { value: "0.75", label: "75%" },
  { value: "0.5", label: "50%" },
  { value: "page", label: "Page Width" },
];

const STYLE_OPTIONS = [
  { value: "0", label: "Paragraph" },
  ...Array.from({ length: MAX_HEADING_LEVEL }, (_, index) => ({
    value: `${index + 1}`,
    label: `Heading ${index + 1}`,
  })),
];

const SHORTCUTS = {
  bold: { key: "B", mod: true },
  italic: { key: "I", mod: true },
  code: { key: "E", mod: true },
  link: { key: "K", mod: true },
  undo: { key: "Z", mod: true },
  redo: { key: "Y", mod: true },
  redoAlternate: { key: "Z", mod: true, shift: true },
  selectAll: { key: "A", mod: true },
  cut: { key: "X", mod: true },
  copy: { key: "C", mod: true },
  paste: { key: "V", mod: true },
  normal: { key: "N", mod: true, shift: true },
  heading1: { key: "1", mod: true, alt: true },
  heading2: { key: "2", mod: true, alt: true },
  heading3: { key: "3", mod: true, alt: true },
  bulletedList: { key: "8", mod: true, shift: true },
  numberedList: { key: "7", mod: true, shift: true },
  quote: { key: ".", mod: true, shift: true },
  lineBreak: { key: "Enter", shift: true },
  horizontalRule: { key: "Enter", mod: true },
  indent: { key: "Tab" },
  outdent: { key: "Tab", shift: true },
} satisfies Record<string, Shortcut>;

const historyKind = (event: ChangeEvent<HTMLTextAreaElement>): HistoryKind => {
  const native = event.nativeEvent;
  const inputType = native instanceof InputEvent ? native.inputType : "";

  if (inputType === "insertText" || inputType === "insertCompositionText") {
    return "insert";
  }

  return inputType.startsWith("delete") ? "delete" : "edit";
};

const sameSelection = (a: Selection, b: Selection) =>
  a.start === b.start && a.end === b.end;

const zoomOption = (value: string) =>
  ZOOM_OPTIONS.find((option) => option.value === value)?.value;

const BoldGlyph = () => (
  <span
    aria-hidden="true"
    className="font-[Arial,sans-serif] text-[13px] leading-none font-bold"
  >
    B
  </span>
);

const ItalicGlyph = () => (
  <span
    aria-hidden="true"
    className="font-(family-name:--font-document) text-[14px] leading-none
      font-bold italic"
  >
    I
  </span>
);

const CodeGlyph = () => (
  <span
    aria-hidden="true"
    className="font-mono text-[11px] leading-none font-bold"
  >
    {"<>"}
  </span>
);

const QuoteGlyph = () => (
  <span
    aria-hidden="true"
    className="font-(family-name:--font-document) text-[20px] leading-none
      font-bold"
  >
    “
  </span>
);

const AquariusEditor = ({
  titleName,
  contentName,
  defaultTitle = "",
  defaultContent = "",
  disabled = false,
  onAddImages,
  ref,
}: {
  titleName: string;
  contentName: string;
  defaultTitle?: string;
  defaultContent?: string;
  disabled?: boolean;
  onAddImages?: (files: File[]) => Promise<string[]>;
  ref?: Ref<AquariusEditorHandle>;
}) => {
  const { value, canUndo, canRedo, record, undo, redo } =
    useEditHistory(defaultContent);
  const [title, setTitle] = useState(defaultTitle);
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [titleCaret, setTitleCaret] = useState(0);
  const [activeField, setActiveField] = useState<Field>("content");
  const [restore, setRestore] = useState<EditorSelection>();
  const [zoom, setZoom] = useState<Zoom>("1");
  const [deskWidth, setDeskWidth] = useState(0);
  const [metrics, setMetrics] = useState({
    caretTop: PAGE_MARGIN,
    pageHeight: PAGE_HEIGHT,
  });
  const [chosenView, setChosenView] = useState<View>();
  const [spellcheck, setSpellcheck] = useState(true);
  const [dialog, setDialog] = useState<Dialog>();
  const [help, setHelp] = useState(false);
  const [stuck, setStuck] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mac = useHydrated() && /Mac|iPhone|iPad/.test(navigator.userAgent);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!restore || !textarea) return;

    textarea.focus({ preventScroll: true });
    textarea.setSelectionRange(restore.selectionStart, restore.selectionEnd);
  }, [restore]);

  useLayoutEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;

    setDeskWidth(desk.clientWidth);
  }, []);

  useEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;

    const observer = new ResizeObserver(() => {
      setDeskWidth(desk.clientWidth);
    });

    observer.observe(desk);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setStuck(
          !entry.isIntersecting && entry.boundingClientRect.top < CHROME_TOP,
        );
      },
      { rootMargin: `-${CHROME_TOP}px 0px 0px 0px` },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const caret = caretRef.current;
    const page = pageRef.current;
    if (!caret || !page) return;

    const next = { caretTop: caret.offsetTop, pageHeight: page.offsetHeight };

    setMetrics((current) =>
      current.caretTop === next.caretTop &&
      current.pageHeight === next.pageHeight
        ? current
        : next,
    );
  }, [value, selection, title, zoom, chosenView, deskWidth]);

  const view = chosenView ?? "fullWidth";
  const pageView = view === "page";
  const availableWidth = deskWidth;
  const scale =
    zoom === "page"
      ? pageView && availableWidth > 0
        ? Math.max(
            MIN_PAGE_SCALE,
            (availableWidth - 2 * PAGE_GUTTER - PAGE_EDGE) / PAGE_WIDTH,
          )
        : 1
      : Number(zoom);
  const pageWidth =
    pageView || availableWidth === 0 ? PAGE_WIDTH : availableWidth / scale;
  const pageMargin = pageView ? PAGE_MARGIN : FULL_WIDTH_MARGIN;
  const gutter = pageView ? PAGE_GUTTER : 0;

  const heading = headingLevel(value, selection.start);
  const bold = isWrapped(value, selection.start, selection.end, BOLD_MARKER);
  const italic = isWrapped(
    value,
    selection.start,
    selection.end,
    ITALIC_MARKER,
  );
  const code = isWrapped(value, selection.start, selection.end, CODE_MARKER);
  const bulleted = isBulleted(value, selection.start);
  const numbered = isNumbered(value, selection.start);
  const quoted = isQuoted(value, selection.start);
  const listItem = isListItem(value, selection.start);
  const hasSelection = selection.start !== selection.end;
  const documentName = title.trim() || UNTITLED_POST;
  const caret = caretPosition(value, selection.start);
  const contentPage = Math.floor(metrics.caretTop / PAGE_HEIGHT) + 1;
  const pages = Math.max(
    contentPage,
    Math.ceil(metrics.pageHeight / PAGE_HEIGHT),
  );
  const status =
    activeField === "title"
      ? {
          page: 1,
          inches: pageMargin / PIXELS_PER_INCH,
          line: 1,
          column: titleCaret + 1,
        }
      : {
          page: contentPage,
          inches: (metrics.caretTop % PAGE_HEIGHT) / PIXELS_PER_INCH,
          line: caret.line,
          column: caret.column,
        };

  const currentSelection = (): EditorSelection => {
    const textarea = textareaRef.current;

    return textarea
      ? {
          value: textarea.value,
          selectionStart: textarea.selectionStart,
          selectionEnd: textarea.selectionEnd,
        }
      : { value, selectionStart: selection.start, selectionEnd: selection.end };
  };

  const travel = (next: EditorSelection | undefined) => {
    if (!next) return;

    setSelection({ start: next.selectionStart, end: next.selectionEnd });
    setRestore({ ...next });
  };

  const commit = (next: EditorSelection) => {
    record(next, "edit", Date.now());
    travel(next);
  };

  const apply = (edit: MarkdownEdit) => {
    commit(edit(currentSelection()));
  };

  const undoEdit = () => {
    travel(undo());
  };

  const redoEdit = () => {
    travel(redo());
  };

  const syncSelection = (textarea: HTMLTextAreaElement) => {
    const next = { start: textarea.selectionStart, end: textarea.selectionEnd };

    setSelection((current) => (sameSelection(current, next) ? current : next));
  };

  const onContentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const {
      value: nextValue,
      selectionStart,
      selectionEnd,
    } = event.currentTarget;

    record(
      { value: nextValue, selectionStart, selectionEnd },
      historyKind(event),
      Date.now(),
    );
    setSelection({ start: selectionStart, end: selectionEnd });
  };

  const submitForm = () => {
    textareaRef.current?.form?.requestSubmit();
  };

  const selectAll = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus({ preventScroll: true });
    textarea.select();
    syncSelection(textarea);
  };

  const copySelection = (cut: boolean) => {
    const current = currentSelection();
    const text = current.value.slice(
      current.selectionStart,
      current.selectionEnd,
    );
    if (text === "") return;

    void navigator.clipboard
      .writeText(text)
      .then(() => {
        if (cut) commit(insertText("")(current));
      })
      .catch(() => undefined);
  };

  const pasteClipboard = () => {
    void navigator.clipboard
      .readText()
      .then((text) => {
        if (text !== "") apply(insertText(text));
      })
      .catch(() => undefined);
  };

  const openLinkDialog = () => {
    const current = currentSelection();

    setDialog({
      kind: "link",
      text: current.value.slice(current.selectionStart, current.selectionEnd),
    });
  };

  const pickImages = () => {
    imageInputRef.current?.click();
  };

  const addImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = pickedFiles(event);
    const names = files.length > 0 ? await onAddImages?.(files) : undefined;

    if (names?.length) {
      apply(insertText(names.map(postImageMarkdown).join("\n")));
    }
  };

  useImperativeHandle(ref, () => ({
    insert: (markdown: string) => {
      apply(insertText(markdown));
    },
  }));

  const contentCommands: { shortcut: Shortcut; run: () => void }[] = [
    { shortcut: SHORTCUTS.bold, run: () => apply(toggleWrap(BOLD_MARKER)) },
    { shortcut: SHORTCUTS.italic, run: () => apply(toggleWrap(ITALIC_MARKER)) },
    { shortcut: SHORTCUTS.code, run: () => apply(toggleWrap(CODE_MARKER)) },
    { shortcut: SHORTCUTS.link, run: openLinkDialog },
    { shortcut: SHORTCUTS.undo, run: undoEdit },
    { shortcut: SHORTCUTS.redo, run: redoEdit },
    { shortcut: SHORTCUTS.redoAlternate, run: redoEdit },
    { shortcut: SHORTCUTS.bulletedList, run: () => apply(toggleBulletedList) },
    { shortcut: SHORTCUTS.numberedList, run: () => apply(toggleNumberedList) },
    { shortcut: SHORTCUTS.quote, run: () => apply(toggleQuote) },
    { shortcut: SHORTCUTS.lineBreak, run: () => apply(insertText(LINE_BREAK)) },
    {
      shortcut: SHORTCUTS.horizontalRule,
      run: () => apply(insertHorizontalRule),
    },
    { shortcut: SHORTCUTS.normal, run: () => apply(setHeading(0)) },
    { shortcut: SHORTCUTS.heading1, run: () => apply(setHeading(1)) },
    { shortcut: SHORTCUTS.heading2, run: () => apply(setHeading(2)) },
    { shortcut: SHORTCUTS.heading3, run: () => apply(setHeading(3)) },
  ];

  const onContentKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) return;

    const command = contentCommands.find(({ shortcut }) =>
      matchesShortcut(shortcut, event, mac),
    );

    if (command) {
      event.preventDefault();
      command.run();
      return;
    }

    const current = currentSelection();

    if (
      matchesShortcut(SHORTCUTS.indent, event, mac) ||
      matchesShortcut(SHORTCUTS.outdent, event, mac)
    ) {
      if (!isListItem(current.value, current.selectionStart)) return;

      event.preventDefault();
      apply(indentLines(event.shiftKey ? -1 : 1));
      return;
    }

    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      const next = continueBlock(current);

      if (next) {
        event.preventDefault();
        commit(next);
      }
    }
  };

  const onTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

    event.preventDefault();
    travel({ value, selectionStart: 0, selectionEnd: 0 });
  };

  const shortcut = (keys: Shortcut) => formatShortcut(keys, mac);

  const menus: AquariusMenu[] = [
    {
      label: "File",
      items: [
        {
          label: "Post",
          disabled,
          run: submitForm,
        },
      ],
    },
    {
      label: "Edit",
      items: [
        {
          label: "Undo",
          shortcut: shortcut(SHORTCUTS.undo),
          disabled: disabled || !canUndo,
          run: undoEdit,
        },
        {
          label: "Redo",
          shortcut: shortcut(SHORTCUTS.redo),
          disabled: disabled || !canRedo,
          run: redoEdit,
        },
        MENU_SEPARATOR,
        {
          label: "Cut",
          shortcut: shortcut(SHORTCUTS.cut),
          disabled: disabled || !hasSelection,
          run: () => copySelection(true),
        },
        {
          label: "Copy",
          shortcut: shortcut(SHORTCUTS.copy),
          disabled: !hasSelection,
          run: () => copySelection(false),
        },
        {
          label: "Paste",
          shortcut: shortcut(SHORTCUTS.paste),
          disabled,
          run: pasteClipboard,
        },
        MENU_SEPARATOR,
        {
          label: "Select All",
          shortcut: shortcut(SHORTCUTS.selectAll),
          run: selectAll,
        },
      ],
    },
    {
      label: "View",
      items: [
        {
          label: "Full Width",
          checked: !pageView,
          radio: true,
          run: () => setChosenView("fullWidth"),
        },
        {
          label: "Page Layout",
          checked: pageView,
          radio: true,
          run: () => setChosenView("page"),
        },
      ],
    },
    {
      label: "Insert",
      items: [
        {
          label: "Line Break",
          shortcut: shortcut(SHORTCUTS.lineBreak),
          disabled,
          run: () => apply(insertText(LINE_BREAK)),
        },
        {
          label: "Horizontal Line",
          shortcut: shortcut(SHORTCUTS.horizontalRule),
          disabled,
          run: () => apply(insertHorizontalRule),
        },
        MENU_SEPARATOR,
        {
          label: "Image...",
          disabled: disabled || !onAddImages,
          run: pickImages,
        },
        {
          label: "Table...",
          disabled,
          run: () => setDialog({ kind: "table" }),
        },
        {
          label: "Link...",
          shortcut: shortcut(SHORTCUTS.link),
          disabled,
          run: openLinkDialog,
        },
        { label: "Code Block", disabled, run: () => apply(insertCodeBlock) },
      ],
    },
    {
      label: "Format",
      items: [
        {
          label: "Bold",
          shortcut: shortcut(SHORTCUTS.bold),
          checked: bold,
          disabled,
          run: () => apply(toggleWrap(BOLD_MARKER)),
        },
        {
          label: "Italic",
          shortcut: shortcut(SHORTCUTS.italic),
          checked: italic,
          disabled,
          run: () => apply(toggleWrap(ITALIC_MARKER)),
        },
        {
          label: "Code",
          shortcut: shortcut(SHORTCUTS.code),
          checked: code,
          disabled,
          run: () => apply(toggleWrap(CODE_MARKER)),
        },
        MENU_SEPARATOR,
        {
          label: "Paragraph",
          shortcut: shortcut(SHORTCUTS.normal),
          checked: heading === 0,
          radio: true,
          disabled,
          run: () => apply(setHeading(0)),
        },
        {
          label: "Heading 1",
          shortcut: shortcut(SHORTCUTS.heading1),
          checked: heading === 1,
          radio: true,
          disabled,
          run: () => apply(setHeading(1)),
        },
        {
          label: "Heading 2",
          shortcut: shortcut(SHORTCUTS.heading2),
          checked: heading === 2,
          radio: true,
          disabled,
          run: () => apply(setHeading(2)),
        },
        {
          label: "Heading 3",
          shortcut: shortcut(SHORTCUTS.heading3),
          checked: heading === 3,
          radio: true,
          disabled,
          run: () => apply(setHeading(3)),
        },
        MENU_SEPARATOR,
        {
          label: "Bulleted List",
          shortcut: shortcut(SHORTCUTS.bulletedList),
          checked: bulleted,
          disabled,
          run: () => apply(toggleBulletedList),
        },
        {
          label: "Numbered List",
          shortcut: shortcut(SHORTCUTS.numberedList),
          checked: numbered,
          disabled,
          run: () => apply(toggleNumberedList),
        },
        {
          label: "Quote",
          shortcut: shortcut(SHORTCUTS.quote),
          checked: quoted,
          disabled,
          run: () => apply(toggleQuote),
        },
        MENU_SEPARATOR,
        {
          label: "Indent List Item",
          shortcut: shortcut(SHORTCUTS.indent),
          disabled: disabled || !listItem,
          run: () => apply(indentLines(1)),
        },
        {
          label: "Outdent List Item",
          shortcut: shortcut(SHORTCUTS.outdent),
          disabled: disabled || !listItem,
          run: () => apply(indentLines(-1)),
        },
      ],
    },
    {
      label: "Tools",
      items: [
        {
          label: "Check Spelling",
          checked: spellcheck,
          run: () => setSpellcheck((checked) => !checked),
        },
        MENU_SEPARATOR,
        {
          label: "Statistics...",
          run: () => setDialog({ kind: "statistics" }),
        },
      ],
    },
    {
      label: "Table",
      items: [
        {
          label: "Insert Table...",
          disabled,
          run: () => setDialog({ kind: "table" }),
        },
      ],
    },
    {
      label: "Help",
      items: [
        { label: "Markdown Help", run: () => setHelp(true) },
        {
          label: "Hide Markdown Help",
          disabled: !help,
          run: () => setHelp(false),
        },
      ],
    },
  ];

  const standardToolbar: ToolbarItem[] = [
    { title: "Post", icon: <PostIcon />, disabled, run: submitForm },
    TOOLBAR_SEPARATOR,
    {
      title: "Cut",
      icon: <CutIcon />,
      disabled: disabled || !hasSelection,
      run: () => copySelection(true),
    },
    {
      title: "Copy",
      icon: <CopyIcon />,
      disabled: !hasSelection,
      run: () => copySelection(false),
    },
    { title: "Paste", icon: <PasteIcon />, disabled, run: pasteClipboard },
    TOOLBAR_SEPARATOR,
    {
      title: "Undo",
      icon: <UndoIcon />,
      disabled: disabled || !canUndo,
      run: undoEdit,
    },
    {
      title: "Redo",
      icon: <RedoIcon />,
      disabled: disabled || !canRedo,
      run: redoEdit,
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Insert Link",
      icon: <LinkIcon />,
      disabled,
      run: openLinkDialog,
    },
    {
      title: "Insert Table",
      icon: <TableIcon />,
      disabled,
      run: () => setDialog({ kind: "table" }),
    },
    {
      title: "Insert Image",
      icon: <ImageIcon />,
      disabled: disabled || !onAddImages,
      run: pickImages,
    },
    {
      title: "Insert Horizontal Line",
      icon: <HorizontalLineIcon />,
      disabled,
      run: () => apply(insertHorizontalRule),
    },
    {
      title: "Insert Code Block",
      icon: <CodeBlockIcon />,
      disabled,
      run: () => apply(insertCodeBlock),
    },
    TOOLBAR_SEPARATOR,
    {
      type: "combo",
      title: "Zoom",
      value: zoom,
      options: ZOOM_OPTIONS,
      width: "w-24",
      onChange: (next) => {
        const option = zoomOption(next);
        if (option) setZoom(option);
      },
    },
    { title: "Markdown Help", icon: <HelpIcon />, run: () => setHelp(true) },
  ];

  const formattingToolbar: ToolbarItem[] = [
    {
      type: "combo",
      title: "Style",
      value: `${heading}`,
      options: STYLE_OPTIONS,
      width: "w-32",
      disabled,
      onChange: (next) => apply(setHeading(Number(next))),
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Bold",
      icon: <BoldGlyph />,
      active: bold,
      disabled,
      run: () => apply(toggleWrap(BOLD_MARKER)),
    },
    {
      title: "Italic",
      icon: <ItalicGlyph />,
      active: italic,
      disabled,
      run: () => apply(toggleWrap(ITALIC_MARKER)),
    },
    {
      title: "Code",
      icon: <CodeGlyph />,
      active: code,
      disabled,
      run: () => apply(toggleWrap(CODE_MARKER)),
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Numbered List",
      icon: <NumberedListIcon />,
      active: numbered,
      disabled,
      run: () => apply(toggleNumberedList),
    },
    {
      title: "Bulleted List",
      icon: <BulletedListIcon />,
      active: bulleted,
      disabled,
      run: () => apply(toggleBulletedList),
    },
    {
      title: "Outdent List Item",
      icon: <OutdentIcon />,
      disabled: disabled || !listItem,
      run: () => apply(indentLines(-1)),
    },
    {
      title: "Indent List Item",
      icon: <IndentIcon />,
      disabled: disabled || !listItem,
      run: () => apply(indentLines(1)),
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Quote",
      icon: <QuoteGlyph />,
      active: quoted,
      disabled,
      run: () => apply(toggleQuote),
    },
  ];

  const statistics = documentStatistics(value);

  return (
    <div
      className="aquarius relative w-full cursor-default bg-(--win-face) p-0.75
        font-(family-name:--font-win) text-[11px] text-black
        shadow-(--bevel-window) select-none"
    >
      <div ref={sentinelRef} aria-hidden="true" className="-mb-px h-px" />

      <div className="sticky z-5 h-0" style={{ top: CHROME_TOP }}>
        {stuck && (
          <div
            aria-hidden="true"
            className="absolute -inset-x-0.75 bottom-0 bg-slate-800"
            style={{ height: CHROME_TOP }}
          />
        )}
      </div>

      <div
        className={`sticky z-20 bg-(--win-face) transition-shadow duration-200
          ${stuck ? "shadow-[0_4px_10px_-4px_rgba(0,0,0,0.4)]" : ""}`}
        style={{ top: CHROME_TOP }}
      >
        <div
          className="flex h-4.5 items-center gap-1 bg-linear-to-r
            from-(--win-caption) to-(--win-caption-end) px-0.5
            text-(--win-light)"
        >
          <span className="flex-1 truncate font-bold">
            {`${documentName} - ${APPLICATION_NAME}`}
          </span>
        </div>

        <AquariusMenuBar menus={menus} />

        <div className="border-t border-(--win-light) pb-1">
          <AquariusToolbar label="Standard" items={standardToolbar} />
          <AquariusToolbar label="Formatting" items={formattingToolbar} />
        </div>
      </div>

      <div
        ref={deskRef}
        className={`overflow-x-auto border-t border-(--win-shadow) ${
          pageView ? "bg-(--win-shadow)" : "min-h-96 bg-(--win-light)"
        }`}
      >
        <div
          className="flex w-max min-w-full justify-center-safe"
          style={{ padding: gutter }}
        >
          <div
            ref={pageRef}
            style={{
              zoom: scale,
              width: pageWidth,
              minHeight: pageView ? PAGE_HEIGHT : undefined,
              padding: pageMargin,
            }}
            className={`relative bg-(--win-light) text-black ${
              pageView
                ? `shadow-[2px_2px_0_0_var(--win-dark)] outline-1
                  outline-(--win-dark)`
                : ""
              }`}
          >
            <input
              id={titleName}
              name={titleName}
              type="text"
              aria-label="Title"
              placeholder="Title"
              autoComplete="off"
              disabled={disabled}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setTitleCaret(event.target.selectionStart ?? 0);
              }}
              onFocus={() => {
                setActiveField("title");
              }}
              onSelect={(event) => {
                setTitleCaret(event.currentTarget.selectionStart ?? 0);
              }}
              onKeyUp={(event) => {
                setTitleCaret(event.currentTarget.selectionStart ?? 0);
              }}
              onKeyDown={onTitleKeyDown}
              className="w-full border-0 bg-transparent p-0
                font-(family-name:--font-document) text-[26px] leading-tight
                font-bold text-black outline-none select-text
                placeholder:text-(--win-shadow)"
            />

            <hr className="my-3 border-0 border-t border-(--win-silver)" />

            <div className="grid">
              <div
                aria-hidden="true"
                className={`${DOCUMENT_TEXT_CLASSES} invisible col-start-1
                  row-start-1`}
              >
                {value.slice(0, selection.start)}
                <span ref={caretRef} />
                {value.slice(selection.start)}
                {"​"}
              </div>
              <textarea
                id={contentName}
                name={contentName}
                ref={textareaRef}
                aria-label="Content"
                rows={1}
                disabled={disabled}
                spellCheck={spellcheck}
                value={value}
                onChange={onContentChange}
                onFocus={() => {
                  setActiveField("content");
                }}
                onSelect={(event) => {
                  syncSelection(event.currentTarget);
                }}
                onKeyUp={(event) => {
                  syncSelection(event.currentTarget);
                }}
                onClick={(event) => {
                  syncSelection(event.currentTarget);
                }}
                onKeyDown={onContentKeyDown}
                className={`${DOCUMENT_TEXT_CLASSES} col-start-1 row-start-1
                  resize-none overflow-hidden select-text`}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="sticky bottom-0 z-5 border-t border-(--win-light)
          bg-(--win-face)"
      >
        <AquariusStatusBar
          page={status.page}
          pages={pages}
          inches={status.inches}
          line={status.line}
          column={status.column}
        />
      </div>

      {help && (
        <AquariusHelp
          onClose={() => {
            setHelp(false);
          }}
        />
      )}

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

      {dialog?.kind === "link" && (
        <LinkDialog
          text={dialog.text}
          onInsert={(text, href) => {
            setDialog(undefined);
            apply(insertLink(text, href));
          }}
          onClose={() => {
            setDialog(undefined);
          }}
        />
      )}

      {dialog?.kind === "table" && (
        <TableDialog
          onInsert={(columns, rows) => {
            setDialog(undefined);
            apply(insertTable(columns, rows));
          }}
          onClose={() => {
            setDialog(undefined);
          }}
        />
      )}

      {dialog?.kind === "statistics" && (
        <StatisticsDialog
          statistics={[
            { label: "Pages", value: pages },
            { label: "Words", value: statistics.words },
            {
              label: "Characters (no spaces)",
              value: statistics.charactersWithoutSpaces,
            },
            {
              label: "Characters (with spaces)",
              value: statistics.charactersWithSpaces,
            },
            { label: "Paragraphs", value: statistics.paragraphs },
            { label: "Lines", value: statistics.lines },
          ]}
          onClose={() => {
            setDialog(undefined);
          }}
        />
      )}
    </div>
  );
};

export default AquariusEditor;
