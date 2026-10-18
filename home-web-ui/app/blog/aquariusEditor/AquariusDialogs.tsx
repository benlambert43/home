import { CloseIcon } from "@/app/blog/aquariusEditor/AquariusIcons";
import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const MAX_TABLE_COLUMNS = 20;

const MAX_TABLE_ROWS = 100;

const FIELD_CLASSES =
  "shadow-(--bevel-sunken) h-5.25 w-full bg-(--win-light) px-1 font-(family-name:--font-win) text-[11px] text-black outline-none select-text";

const clamp = (value: number, min: number, max: number) =>
  Math.min(
    max,
    Math.max(min, Number.isFinite(value) ? Math.round(value) : min),
  );

const DialogButton = ({
  children,
  primary = false,
  disabled = false,
  onClick,
}: {
  children: string;
  primary?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`h-5.75 w-18.75 border bg-(--win-face) shadow-(--bevel-raised)
      focus:outline-none focus-visible:outline-1 focus-visible:-outline-offset-4
      focus-visible:outline-black focus-visible:outline-dotted
      active:shadow-(--bevel-sunken) disabled:text-(--win-shadow)
      disabled:[text-shadow:1px_1px_var(--win-light)] ${
        primary ? "border-black" : "border-transparent"
      }`}
  >
    {children}
  </button>
);

const AquariusDialog = ({
  title,
  onClose,
  onConfirm,
  children,
}: {
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  children: ReactNode;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    dialog.showModal();

    const field = dialog.querySelector<HTMLElement>("[data-autofocus]");
    field?.focus();
    if (field instanceof HTMLInputElement) field.select();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (
      event.key === "Enter" &&
      onConfirm &&
      event.target instanceof HTMLInputElement
    ) {
      event.preventDefault();
      onConfirm();
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      onKeyDown={onKeyDown}
      className="aquarius m-auto max-w-[calc(100vw-2rem)] cursor-default
        bg-(--win-face) p-0.75 font-(family-name:--font-win) text-[11px]
        text-black shadow-(--bevel-window) select-none backdrop:bg-transparent"
    >
      <div
        className="flex h-4.5 items-center gap-1 bg-linear-to-r
          from-(--win-caption) to-(--win-caption-end) px-0.5 text-(--win-light)"
      >
        <span className="flex-1 truncate pl-0.5 font-bold">{title}</span>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-3.5 w-4 items-center justify-center bg-(--win-face)
            shadow-(--bevel-raised) focus:outline-none
            active:shadow-(--bevel-sunken)"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="p-3">{children}</div>
    </dialog>,
    document.body,
  );
};

export const LinkDialog = ({
  text: initialText,
  onInsert,
  onClose,
}: {
  text: string;
  onInsert: (text: string, href: string) => void;
  onClose: () => void;
}) => {
  const [text, setText] = useState(initialText);
  const [href, setHref] = useState("https://");
  const id = useId();
  const ready = href.trim() !== "" && href.trim() !== "https://";

  const insert = () => {
    if (ready) onInsert(text.trim(), href.trim());
  };

  return (
    <AquariusDialog title="Insert Link" onClose={onClose} onConfirm={insert}>
      <div className="flex w-80 max-w-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-text`}>Text to display:</label>
          <input
            id={`${id}-text`}
            type="text"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
            }}
            className={FIELD_CLASSES}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-href`}>Link address:</label>
          <input
            id={`${id}-href`}
            type="url"
            value={href}
            data-autofocus
            onChange={(event) => {
              setHref(event.target.value);
            }}
            className={FIELD_CLASSES}
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <DialogButton primary disabled={!ready} onClick={insert}>
            OK
          </DialogButton>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
        </div>
      </div>
    </AquariusDialog>
  );
};

export const TableDialog = ({
  onInsert,
  onClose,
}: {
  onInsert: (columns: number, rows: number) => void;
  onClose: () => void;
}) => {
  const [columns, setColumns] = useState("2");
  const [rows, setRows] = useState("2");
  const id = useId();

  const insert = () => {
    onInsert(
      clamp(Number(columns), 1, MAX_TABLE_COLUMNS),
      clamp(Number(rows), 1, MAX_TABLE_ROWS),
    );
  };

  return (
    <AquariusDialog title="Insert Table" onClose={onClose} onConfirm={insert}>
      <div className="flex w-64 max-w-full flex-col gap-3">
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 font-bold">Table size</legend>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`${id}-columns`}>Number of columns:</label>
            <input
              id={`${id}-columns`}
              type="number"
              min={1}
              max={MAX_TABLE_COLUMNS}
              value={columns}
              data-autofocus
              onChange={(event) => {
                setColumns(event.target.value);
              }}
              className={`${FIELD_CLASSES} w-16`}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={`${id}-rows`}>Number of rows:</label>
            <input
              id={`${id}-rows`}
              type="number"
              min={1}
              max={MAX_TABLE_ROWS}
              value={rows}
              onChange={(event) => {
                setRows(event.target.value);
              }}
              className={`${FIELD_CLASSES} w-16`}
            />
          </div>
        </fieldset>
        <div className="flex justify-end gap-2 pt-1">
          <DialogButton primary onClick={insert}>
            OK
          </DialogButton>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
        </div>
      </div>
    </AquariusDialog>
  );
};

export const StatisticsDialog = ({
  statistics,
  onClose,
}: {
  statistics: { label: string; value: number }[];
  onClose: () => void;
}) => (
  <AquariusDialog title="Statistics" onClose={onClose}>
    <div className="flex w-64 max-w-full flex-col gap-3">
      <p className="font-bold">Statistics:</p>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 pl-2">
        {statistics.map(({ label, value }) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd className="text-right">{value.toLocaleString("en-US")}</dd>
          </div>
        ))}
      </dl>
      <div className="flex justify-end pt-1">
        <DialogButton primary onClick={onClose}>
          Close
        </DialogButton>
      </div>
    </div>
  </AquariusDialog>
);
