"use client";

import "@/app/blog/aquariusEditor/aquariusEditor.css";
import {
  ImageDialog,
  LinkDialog,
  StatisticsDialog,
  TableDialog,
} from "@/app/blog/aquariusEditor/AquariusDialogs";
import AquariusHelp from "@/app/blog/aquariusEditor/AquariusHelp";
import {
  AquariusImage,
  EditorImagesContext,
  imageAlt,
} from "@/app/blog/aquariusEditor/AquariusImage";
import {
  BulletedListIcon,
  CodeBlockIcon,
  CopyIcon,
  CutIcon,
  HelpIcon,
  HorizontalLineIcon,
  ImageIcon,
  IndentIcon,
  LinkIcon,
  NumberedListIcon,
  OutdentIcon,
  PasteIcon,
  PostIcon,
  RedoIcon,
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
import { documentStatistics } from "@/app/blog/aquariusEditor/documentStatistics";
import {
  HEADING_LEVELS,
  HeadingLevel,
  LIST_ITEM,
  postMarkdownExtensions,
} from "@/app/blog/aquariusEditor/postMarkdown";
import {
  formatShortcut,
  matchesShortcut,
  Shortcut,
} from "@/app/blog/aquariusEditor/shortcuts";
import { PostFormImage } from "@/app/blog/postForm/postFormImages";
import {
  ACCEPTED_POST_IMAGE_TYPES,
  pickedFiles,
} from "@/app/blog/postImageFiles";
import { useHydrated } from "@/app/lib/useHydrated";
import { normalizePostContent, postImageReference } from "@home/shared";
import { Fragment, Slice } from "@tiptap/pm/model";
import { EditorState } from "@tiptap/pm/state";
import { EditorProps, EditorView } from "@tiptap/pm/view";
import {
  ChainedCommands,
  Editor,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import {
  ChangeEvent,
  KeyboardEvent,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AquariusEditorHandle = { insertImage: (name: string) => void };

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

const DOCUMENT_CLASSES =
  "prose max-w-none font-(family-name:--font-document) text-black outline-none select-text";

const URL_TEXT = /^https?:\/\/\S+$/i;

type Zoom = "2" | "1.5" | "1" | "0.75" | "0.5" | "page";

type View = "page" | "fullWidth";

type Field = "title" | "content";

type Dialog =
  | { kind: "link"; text: string; href?: string }
  | { kind: "image"; position: number; alt: string }
  | { kind: "table" }
  | { kind: "statistics" };

type Chrome = {
  heading: number;
  bold: boolean;
  italic: boolean;
  strike: boolean;
  code: boolean;
  bulleted: boolean;
  numbered: boolean;
  quoted: boolean;
  codeBlock: boolean;
  listItem: boolean;
  table: boolean;
  headerRow: boolean;
  link: boolean;
  image: boolean;
  imageInSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  line: number;
  column: number;
};

type Handlers = {
  keyDown: (event: globalThis.KeyboardEvent) => boolean;
  paste: (event: ClipboardEvent) => boolean;
  drop: (view: EditorView, event: DragEvent, moved: boolean) => boolean;
};

const IDLE_CHROME: Chrome = {
  heading: 0,
  bold: false,
  italic: false,
  strike: false,
  code: false,
  bulleted: false,
  numbered: false,
  quoted: false,
  codeBlock: false,
  listItem: false,
  table: false,
  headerRow: false,
  link: false,
  image: false,
  imageInSelection: false,
  canUndo: false,
  canRedo: false,
  hasSelection: false,
  line: 1,
  column: 1,
};

const IDLE_HANDLERS: Handlers = {
  keyDown: () => false,
  paste: () => false,
  drop: () => false,
};

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
  ...HEADING_LEVELS.map((level) => ({
    value: `${level}`,
    label: `Heading ${level}`,
  })),
];

const SHORTCUTS = {
  bold: { key: "B", mod: true },
  italic: { key: "I", mod: true },
  strike: { key: "S", mod: true, shift: true },
  code: { key: "E", mod: true },
  codeBlock: { key: "C", mod: true, alt: true },
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

const isHeadingLevel = (level: number): level is HeadingLevel =>
  HEADING_LEVELS.some((known) => known === level);

const caretPosition = ({ doc, selection }: EditorState) => {
  let line = 0;

  doc.nodesBetween(0, selection.head, (node) => {
    if (node.isTextblock) line += 1;
  });

  return { line: Math.max(line, 1), column: selection.$head.parentOffset + 1 };
};

const selectionHasImage = ({ doc, selection }: EditorState) => {
  let found = false;

  doc.nodesBetween(selection.from, selection.to, (node) => {
    found ||= node.type.name === "image";
    return !found;
  });

  return found;
};

const chromeState = (editor: Editor): Chrome => ({
  heading:
    HEADING_LEVELS.find((level) => editor.isActive("heading", { level })) ?? 0,
  bold: editor.isActive("bold"),
  italic: editor.isActive("italic"),
  strike: editor.isActive("strike"),
  code: editor.isActive("code"),
  bulleted: editor.isActive("bulletList"),
  numbered: editor.isActive("orderedList"),
  quoted: editor.isActive("blockquote"),
  codeBlock: editor.isActive("codeBlock"),
  listItem: editor.isActive(LIST_ITEM),
  table: editor.isActive("table"),
  headerRow: editor.isActive("tableHeader"),
  link: editor.isActive("link"),
  image: editor.isActive("image"),
  imageInSelection: selectionHasImage(editor.state),
  canUndo: editor.can().undo(),
  canRedo: editor.can().redo(),
  hasSelection: !editor.state.selection.empty,
  ...caretPosition(editor.state),
});

const transferredFiles = (transfer: DataTransfer | null) => [
  ...(transfer?.files ?? []),
];

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

const StrikeGlyph = () => (
  <span
    aria-hidden="true"
    className="font-[Arial,sans-serif] text-[13px] leading-none font-bold
      line-through"
  >
    S
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
  images = [],
  disabled = false,
  onAddImages,
  ref,
}: {
  titleName: string;
  contentName: string;
  defaultTitle?: string;
  defaultContent?: string;
  images?: PostFormImage[];
  disabled?: boolean;
  onAddImages?: (files: File[]) => Promise<string[]>;
  ref?: Ref<AquariusEditorHandle>;
}) => {
  const [title, setTitle] = useState(defaultTitle);
  const [markdown, setMarkdown] = useState(defaultContent);
  const [titleCaret, setTitleCaret] = useState(0);
  const [activeField, setActiveField] = useState<Field>("content");
  const [zoom, setZoom] = useState<Zoom>("1");
  const [deskWidth, setDeskWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(PAGE_HEIGHT);
  const [caretTop, setCaretTop] = useState(PAGE_MARGIN);
  const [chosenView, setChosenView] = useState<View>();
  const [spellcheck, setSpellcheck] = useState(true);
  const [dialog, setDialog] = useState<Dialog>();
  const [help, setHelp] = useState(false);
  const [stuck, setStuck] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const baseline = useRef("");
  const handlers = useRef<Handlers>(IDLE_HANDLERS);
  const mac = useHydrated() && /Mac|iPhone|iPad/.test(navigator.userAgent);

  const extensions = useMemo(
    () => [...postMarkdownExtensions(), AquariusImage],
    [],
  );

  const editorProps = useMemo<EditorProps>(
    () => ({
      attributes: { class: DOCUMENT_CLASSES, "aria-label": "Content" },
      handleKeyDown: (_view, event) => handlers.current.keyDown(event),
      handlePaste: (_view, event) => handlers.current.paste(event),
      handleDrop: (view, event, _slice, moved) =>
        handlers.current.drop(view, event, moved),
    }),
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    extensions,
    editorProps,
    content: defaultContent,
    contentType: "markdown",
    onCreate: ({ editor: created }) => {
      baseline.current = normalizePostContent(created.getMarkdown());
      setTitle(defaultTitle);
      setMarkdown(defaultContent);
    },
    onUpdate: ({ editor: updated }) => {
      const next = updated.getMarkdown();

      setMarkdown(
        normalizePostContent(next) === baseline.current ? defaultContent : next,
      );
    },
  });

  const chrome =
    useEditorState({
      editor,
      selector: ({ editor: current }) => current && chromeState(current),
    }) ?? IDLE_CHROME;

  const editImage = useCallback((position: number, alt: string) => {
    setDialog({ kind: "image", position, alt });
  }, []);

  const editorImages = useMemo(
    () => ({ images, editImage }),
    [images, editImage],
  );

  useEffect(() => {
    if (editor && editor.isEditable === disabled) {
      editor.setEditable(!disabled, false);
    }
  }, [editor, disabled]);

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

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    setPageHeight(page.offsetHeight);

    const observer = new ResizeObserver(() => {
      setPageHeight(page.offsetHeight);
    });

    observer.observe(page);

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
  const scrollable = pageView && (zoom !== "page" || scale === MIN_PAGE_SCALE);

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page || !editor?.isInitialized) return;

    const caret = editor.view.coordsAtPos(editor.state.selection.head);

    setCaretTop((caret.top - page.getBoundingClientRect().top) / scale);
  }, [editor, chrome, title, zoom, chosenView, deskWidth, pageHeight, scale]);

  const off = disabled || !editor;
  const lineBreakAllowed = !chrome.table && chrome.heading === 0;
  const documentName = title.trim() || UNTITLED_POST;
  const contentPage = Math.floor(caretTop / PAGE_HEIGHT) + 1;
  const pages = Math.max(contentPage, Math.ceil(pageHeight / PAGE_HEIGHT));
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
          inches: (caretTop % PAGE_HEIGHT) / PIXELS_PER_INCH,
          line: chrome.line,
          column: chrome.column,
        };

  const exec = (command: (chain: ChainedCommands) => ChainedCommands) => {
    if (editor) command(editor.chain().focus()).run();
  };

  const undoEdit = () => {
    exec((chain) => chain.undo());
  };

  const redoEdit = () => {
    exec((chain) => chain.redo());
  };

  const setStyle = (value: string) => {
    const level = Number(value);

    exec((chain) =>
      isHeadingLevel(level)
        ? chain.setHeading({ level })
        : chain.setParagraph(),
    );
  };

  const insertLineBreak = () => {
    if (lineBreakAllowed) exec((chain) => chain.setHardBreak());
  };

  const submitForm = () => {
    contentInputRef.current?.form?.requestSubmit();
  };

  const selectAll = () => {
    exec((chain) => chain.selectAll());
  };

  const copySelection = (cut: boolean) => {
    if (!editor || editor.state.selection.empty) return;

    const { dom, text } = editor.view.serializeForClipboard(
      editor.state.selection.content(),
    );
    const written =
      typeof ClipboardItem === "undefined"
        ? navigator.clipboard.writeText(text)
        : navigator.clipboard.write([
            new ClipboardItem({
              "text/html": new Blob([dom.innerHTML], { type: "text/html" }),
              "text/plain": new Blob([text], { type: "text/plain" }),
            }),
          ]);

    void written
      .then(() => {
        if (cut) exec((chain) => chain.deleteSelection());
      })
      .catch(() => undefined);
  };

  const pasteMarkdown = (text: string) => {
    if (
      !editor?.markdown ||
      editor.isActive("codeBlock") ||
      editor.isActive("table")
    ) {
      return false;
    }

    try {
      const content = editor.markdown.parse(text).content;
      if (!content?.length) return false;

      const fragment = Fragment.fromJSON(editor.schema, content);
      const slice = new Slice(
        fragment,
        fragment.firstChild?.isTextblock ? 1 : 0,
        fragment.lastChild?.isTextblock ? 1 : 0,
      );

      editor.view.dispatch(
        editor.state.tr.replaceSelection(slice).scrollIntoView(),
      );

      return true;
    } catch {
      return false;
    }
  };

  const pasteClipboard = () => {
    if (!editor) return;

    const { view: editorView } = editor;

    void navigator.clipboard
      .read()
      .then(async (items) => {
        const html = items.find((item) => item.types.includes("text/html"));

        if (html) {
          editorView.pasteHTML(await (await html.getType("text/html")).text());
          return;
        }

        const text = await navigator.clipboard.readText();

        if (text !== "" && !pasteMarkdown(text)) editorView.pasteText(text);
      })
      .catch(() => undefined);
  };

  const insertImages = (names: string[], at?: number) => {
    const nodes = names.map((name) => ({
      type: "paragraph",
      content: [{ type: "image", attrs: { src: postImageReference(name) } }],
    }));

    exec((chain) =>
      at === undefined
        ? chain.insertContent(nodes)
        : chain.insertContentAt(at, nodes),
    );
  };

  const addImages = async (files: File[], at?: number) => {
    const names = files.length > 0 ? await onAddImages?.(files) : undefined;

    if (names?.length) insertImages(names, at);
  };

  const pickImages = () => {
    imageInputRef.current?.click();
  };

  const openLinkDialog = () => {
    if (!editor || chrome.imageInSelection) return;

    if (editor.isActive("link")) editor.commands.extendMarkRange("link");

    const { from, to } = editor.state.selection;
    const href: unknown = editor.getAttributes("link").href;

    setDialog({
      kind: "link",
      text: editor.state.doc.textBetween(from, to, " "),
      href: typeof href === "string" ? href : undefined,
    });
  };

  const insertLink = (text: string, href: string, selectedText: string) => {
    exec((chain) =>
      text !== "" && text === selectedText.trim()
        ? chain.setMark("link", { href })
        : chain.insertContent({
            type: "text",
            text: text || href,
            marks: [{ type: "link", attrs: { href } }],
          }),
    );
  };

  const removeLink = () => {
    exec((chain) => chain.unsetLink());
  };

  const openImageDialog = () => {
    if (editor && chrome.image) {
      editImage(
        editor.state.selection.from,
        imageAlt(editor.getAttributes("image")),
      );
    }
  };

  const saveImageAlt = (position: number, alt: string) => {
    exec((chain) =>
      chain.setNodeSelection(position).updateAttributes("image", {
        alt: alt || null,
      }),
    );
  };

  useImperativeHandle(ref, () => ({
    insertImage: (name: string) => {
      insertImages([name]);
    },
  }));

  const contentCommands: { shortcut: Shortcut; run: () => void }[] = [
    {
      shortcut: SHORTCUTS.bold,
      run: () => exec((chain) => chain.toggleBold()),
    },
    {
      shortcut: SHORTCUTS.italic,
      run: () => exec((chain) => chain.toggleItalic()),
    },
    {
      shortcut: SHORTCUTS.strike,
      run: () => exec((chain) => chain.toggleStrike()),
    },
    {
      shortcut: SHORTCUTS.code,
      run: () => exec((chain) => chain.toggleCode()),
    },
    {
      shortcut: SHORTCUTS.codeBlock,
      run: () => exec((chain) => chain.toggleCodeBlock()),
    },
    { shortcut: SHORTCUTS.link, run: openLinkDialog },
    { shortcut: SHORTCUTS.undo, run: undoEdit },
    { shortcut: SHORTCUTS.redo, run: redoEdit },
    { shortcut: SHORTCUTS.redoAlternate, run: redoEdit },
    {
      shortcut: SHORTCUTS.bulletedList,
      run: () => exec((chain) => chain.toggleBulletList()),
    },
    {
      shortcut: SHORTCUTS.numberedList,
      run: () => exec((chain) => chain.toggleOrderedList()),
    },
    {
      shortcut: SHORTCUTS.quote,
      run: () => exec((chain) => chain.toggleBlockquote()),
    },
    { shortcut: SHORTCUTS.lineBreak, run: insertLineBreak },
    {
      shortcut: SHORTCUTS.horizontalRule,
      run: () => exec((chain) => chain.setHorizontalRule()),
    },
    { shortcut: SHORTCUTS.normal, run: () => setStyle("0") },
    { shortcut: SHORTCUTS.heading1, run: () => setStyle("1") },
    { shortcut: SHORTCUTS.heading2, run: () => setStyle("2") },
    { shortcut: SHORTCUTS.heading3, run: () => setStyle("3") },
  ];

  const onContentKeyDown = (event: globalThis.KeyboardEvent) => {
    if (event.isComposing || disabled) return false;

    const command = contentCommands.find(({ shortcut }) =>
      matchesShortcut(shortcut, event, mac),
    );

    if (!command) return false;

    command.run();
    return true;
  };

  const onPaste = (event: ClipboardEvent) => {
    const transfer = event.clipboardData;
    if (!transfer) return false;

    const files = transferredFiles(transfer);

    if (files.length > 0) {
      void addImages(files);
      return true;
    }

    if (transfer.types.includes("text/html")) return false;

    const text = transfer.getData("text/plain");

    if (
      text === "" ||
      (URL_TEXT.test(text.trim()) && !editor?.state.selection.empty)
    ) {
      return false;
    }

    return pasteMarkdown(text);
  };

  const onDrop = (editorView: EditorView, event: DragEvent, moved: boolean) => {
    const files = transferredFiles(event.dataTransfer);
    if (moved || files.length === 0) return false;

    const at = editorView.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    })?.pos;

    void addImages(files, at);
    return true;
  };

  useLayoutEffect(() => {
    handlers.current = {
      keyDown: onContentKeyDown,
      paste: onPaste,
      drop: onDrop,
    };
  });

  const onTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;

    event.preventDefault();
    editor?.chain().focus("start").run();
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
          disabled: off || !chrome.canUndo,
          run: undoEdit,
        },
        {
          label: "Redo",
          shortcut: shortcut(SHORTCUTS.redo),
          disabled: off || !chrome.canRedo,
          run: redoEdit,
        },
        MENU_SEPARATOR,
        {
          label: "Cut",
          shortcut: shortcut(SHORTCUTS.cut),
          disabled: off || !chrome.hasSelection,
          run: () => copySelection(true),
        },
        {
          label: "Copy",
          shortcut: shortcut(SHORTCUTS.copy),
          disabled: !chrome.hasSelection,
          run: () => copySelection(false),
        },
        {
          label: "Paste",
          shortcut: shortcut(SHORTCUTS.paste),
          disabled: off,
          run: pasteClipboard,
        },
        MENU_SEPARATOR,
        {
          label: "Select All",
          shortcut: shortcut(SHORTCUTS.selectAll),
          disabled: !editor,
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
          disabled: off || !lineBreakAllowed,
          run: insertLineBreak,
        },
        {
          label: "Horizontal Line",
          shortcut: shortcut(SHORTCUTS.horizontalRule),
          disabled: off || chrome.table,
          run: () => exec((chain) => chain.setHorizontalRule()),
        },
        MENU_SEPARATOR,
        {
          label: "Image...",
          disabled: off || !onAddImages || chrome.table,
          run: pickImages,
        },
        {
          label: "Table...",
          disabled: off || chrome.table,
          run: () => setDialog({ kind: "table" }),
        },
        {
          label: "Link...",
          shortcut: shortcut(SHORTCUTS.link),
          disabled: off || chrome.imageInSelection,
          run: openLinkDialog,
        },
        {
          label: "Remove Link",
          disabled: off || !chrome.link,
          run: removeLink,
        },
        {
          label: "Code Block",
          shortcut: shortcut(SHORTCUTS.codeBlock),
          checked: chrome.codeBlock,
          disabled: off || chrome.table,
          run: () => exec((chain) => chain.toggleCodeBlock()),
        },
      ],
    },
    {
      label: "Format",
      items: [
        {
          label: "Bold",
          shortcut: shortcut(SHORTCUTS.bold),
          checked: chrome.bold,
          disabled: off,
          run: () => exec((chain) => chain.toggleBold()),
        },
        {
          label: "Italic",
          shortcut: shortcut(SHORTCUTS.italic),
          checked: chrome.italic,
          disabled: off,
          run: () => exec((chain) => chain.toggleItalic()),
        },
        {
          label: "Strikethrough",
          shortcut: shortcut(SHORTCUTS.strike),
          checked: chrome.strike,
          disabled: off,
          run: () => exec((chain) => chain.toggleStrike()),
        },
        {
          label: "Code",
          shortcut: shortcut(SHORTCUTS.code),
          checked: chrome.code,
          disabled: off,
          run: () => exec((chain) => chain.toggleCode()),
        },
        MENU_SEPARATOR,
        {
          label: "Paragraph",
          shortcut: shortcut(SHORTCUTS.normal),
          checked: chrome.heading === 0,
          radio: true,
          disabled: off,
          run: () => setStyle("0"),
        },
        {
          label: "Heading 1",
          shortcut: shortcut(SHORTCUTS.heading1),
          checked: chrome.heading === 1,
          radio: true,
          disabled: off,
          run: () => setStyle("1"),
        },
        {
          label: "Heading 2",
          shortcut: shortcut(SHORTCUTS.heading2),
          checked: chrome.heading === 2,
          radio: true,
          disabled: off,
          run: () => setStyle("2"),
        },
        {
          label: "Heading 3",
          shortcut: shortcut(SHORTCUTS.heading3),
          checked: chrome.heading === 3,
          radio: true,
          disabled: off,
          run: () => setStyle("3"),
        },
        MENU_SEPARATOR,
        {
          label: "Bulleted List",
          shortcut: shortcut(SHORTCUTS.bulletedList),
          checked: chrome.bulleted,
          disabled: off,
          run: () => exec((chain) => chain.toggleBulletList()),
        },
        {
          label: "Numbered List",
          shortcut: shortcut(SHORTCUTS.numberedList),
          checked: chrome.numbered,
          disabled: off,
          run: () => exec((chain) => chain.toggleOrderedList()),
        },
        {
          label: "Quote",
          shortcut: shortcut(SHORTCUTS.quote),
          checked: chrome.quoted,
          disabled: off,
          run: () => exec((chain) => chain.toggleBlockquote()),
        },
        MENU_SEPARATOR,
        {
          label: "Indent List Item",
          shortcut: shortcut(SHORTCUTS.indent),
          disabled: off || !chrome.listItem,
          run: () => exec((chain) => chain.sinkListItem(LIST_ITEM)),
        },
        {
          label: "Outdent List Item",
          shortcut: shortcut(SHORTCUTS.outdent),
          disabled: off || !chrome.listItem,
          run: () => exec((chain) => chain.liftListItem(LIST_ITEM)),
        },
        MENU_SEPARATOR,
        {
          label: "Image Description...",
          disabled: off || !chrome.image,
          run: openImageDialog,
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
          disabled: !editor,
          run: () => setDialog({ kind: "statistics" }),
        },
      ],
    },
    {
      label: "Table",
      items: [
        {
          label: "Insert Table...",
          disabled: off || chrome.table,
          run: () => setDialog({ kind: "table" }),
        },
        MENU_SEPARATOR,
        {
          label: "Insert Row Above",
          disabled: off || !chrome.table || chrome.headerRow,
          run: () => exec((chain) => chain.addRowBefore()),
        },
        {
          label: "Insert Row Below",
          disabled: off || !chrome.table,
          run: () => exec((chain) => chain.addRowAfter()),
        },
        {
          label: "Insert Column Left",
          disabled: off || !chrome.table,
          run: () => exec((chain) => chain.addColumnBefore()),
        },
        {
          label: "Insert Column Right",
          disabled: off || !chrome.table,
          run: () => exec((chain) => chain.addColumnAfter()),
        },
        MENU_SEPARATOR,
        {
          label: "Delete Row",
          disabled: off || !chrome.table || chrome.headerRow,
          run: () => exec((chain) => chain.deleteRow()),
        },
        {
          label: "Delete Column",
          disabled: off || !chrome.table,
          run: () => exec((chain) => chain.deleteColumn()),
        },
        {
          label: "Delete Table",
          disabled: off || !chrome.table,
          run: () => exec((chain) => chain.deleteTable()),
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
      disabled: off || !chrome.hasSelection,
      run: () => copySelection(true),
    },
    {
      title: "Copy",
      icon: <CopyIcon />,
      disabled: !chrome.hasSelection,
      run: () => copySelection(false),
    },
    { title: "Paste", icon: <PasteIcon />, disabled: off, run: pasteClipboard },
    TOOLBAR_SEPARATOR,
    {
      title: "Undo",
      icon: <UndoIcon />,
      disabled: off || !chrome.canUndo,
      run: undoEdit,
    },
    {
      title: "Redo",
      icon: <RedoIcon />,
      disabled: off || !chrome.canRedo,
      run: redoEdit,
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Insert Link",
      icon: <LinkIcon />,
      disabled: off || chrome.imageInSelection,
      run: openLinkDialog,
    },
    {
      title: "Insert Table",
      icon: <TableIcon />,
      disabled: off || chrome.table,
      run: () => setDialog({ kind: "table" }),
    },
    {
      title: "Insert Image",
      icon: <ImageIcon />,
      disabled: off || !onAddImages || chrome.table,
      run: pickImages,
    },
    {
      title: "Insert Horizontal Line",
      icon: <HorizontalLineIcon />,
      disabled: off || chrome.table,
      run: () => exec((chain) => chain.setHorizontalRule()),
    },
    {
      title: "Code Block",
      icon: <CodeBlockIcon />,
      active: chrome.codeBlock,
      disabled: off || chrome.table,
      run: () => exec((chain) => chain.toggleCodeBlock()),
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
      value: `${chrome.heading}`,
      options: STYLE_OPTIONS,
      width: "w-32",
      disabled: off,
      onChange: setStyle,
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Bold",
      icon: <BoldGlyph />,
      active: chrome.bold,
      disabled: off,
      run: () => exec((chain) => chain.toggleBold()),
    },
    {
      title: "Italic",
      icon: <ItalicGlyph />,
      active: chrome.italic,
      disabled: off,
      run: () => exec((chain) => chain.toggleItalic()),
    },
    {
      title: "Strikethrough",
      icon: <StrikeGlyph />,
      active: chrome.strike,
      disabled: off,
      run: () => exec((chain) => chain.toggleStrike()),
    },
    {
      title: "Code",
      icon: <CodeGlyph />,
      active: chrome.code,
      disabled: off,
      run: () => exec((chain) => chain.toggleCode()),
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Numbered List",
      icon: <NumberedListIcon />,
      active: chrome.numbered,
      disabled: off,
      run: () => exec((chain) => chain.toggleOrderedList()),
    },
    {
      title: "Bulleted List",
      icon: <BulletedListIcon />,
      active: chrome.bulleted,
      disabled: off,
      run: () => exec((chain) => chain.toggleBulletList()),
    },
    {
      title: "Outdent List Item",
      icon: <OutdentIcon />,
      disabled: off || !chrome.listItem,
      run: () => exec((chain) => chain.liftListItem(LIST_ITEM)),
    },
    {
      title: "Indent List Item",
      icon: <IndentIcon />,
      disabled: off || !chrome.listItem,
      run: () => exec((chain) => chain.sinkListItem(LIST_ITEM)),
    },
    TOOLBAR_SEPARATOR,
    {
      title: "Quote",
      icon: <QuoteGlyph />,
      active: chrome.quoted,
      disabled: off,
      run: () => exec((chain) => chain.toggleBlockquote()),
    },
  ];

  const statistics =
    dialog?.kind === "statistics" && editor
      ? documentStatistics(editor.state.doc)
      : undefined;

  return (
    <EditorImagesContext value={editorImages}>
      <div
        className="aquarius relative w-full cursor-default bg-(--win-face)
          p-0.75 font-(family-name:--font-win) text-[11px] text-black
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
          className={`border-t border-(--win-shadow) ${
            scrollable ? "overflow-x-auto" : "overflow-x-clip"
          }
            ${pageView ? "bg-(--win-shadow)" : "min-h-96 bg-(--win-light)"}`}
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

              <div
                spellCheck={spellcheck}
                onFocus={() => {
                  setActiveField("content");
                }}
              >
                <EditorContent editor={editor} />
              </div>

              <input
                ref={contentInputRef}
                type="hidden"
                name={contentName}
                value={markdown}
              />
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
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            void addImages(pickedFiles(event));
          }}
        />

        {dialog?.kind === "link" && (
          <LinkDialog
            text={dialog.text}
            href={dialog.href}
            onInsert={(text, href) => {
              setDialog(undefined);
              insertLink(text, href, dialog.text);
            }}
            onClose={() => {
              setDialog(undefined);
            }}
          />
        )}

        {dialog?.kind === "image" && (
          <ImageDialog
            alt={dialog.alt}
            onSave={(alt) => {
              setDialog(undefined);
              saveImageAlt(dialog.position, alt);
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
              exec((chain) =>
                chain.insertTable({ rows, cols: columns, withHeaderRow: true }),
              );
            }}
            onClose={() => {
              setDialog(undefined);
            }}
          />
        )}

        {statistics && (
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
    </EditorImagesContext>
  );
};

export default AquariusEditor;
