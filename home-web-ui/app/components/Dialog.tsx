"use client";

import { ReactNode, useEffect, useRef } from "react";

type DialogPlacement = "center" | "start";

type PlacementClasses = {
  dialog: string;
  layout: string;
  panel?: string;
};

const PLACEMENT_CLASSES: Record<DialogPlacement, PlacementClasses> = {
  center: {
    dialog:
      "bg-slate-950/70 opacity-0 transition-[opacity,display,overlay] transition-discrete duration-200 open:opacity-100 starting:open:opacity-0",
    layout: "flex min-h-full items-center justify-center p-4",
  },
  start: {
    dialog:
      "bg-slate-950/0 transition-[background-color,display,overlay] transition-discrete duration-200 ease-in open:bg-slate-950/70 open:duration-300 open:ease-out starting:open:bg-slate-950/0",
    layout: "flex min-h-full justify-start",
    panel:
      "flex -translate-x-full outline-none transition-transform duration-200 ease-in group-open:translate-x-0 group-open:duration-300 group-open:ease-out starting:group-open:-translate-x-full motion-reduce:transition-none",
  },
};

type DialogProps = {
  open: boolean;
  onClose: () => void;
  label?: string;
  labelledBy?: string;
  dismissible?: boolean;
  placement?: DialogPlacement;
  children?: ReactNode;
};

const Dialog = ({
  open,
  onClose,
  label,
  labelledBy,
  dismissible = true,
  placement = "center",
  children,
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { dialog: dialogClasses, layout, panel } = PLACEMENT_CLASSES[placement];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      panelRef.current?.focus({ preventScroll: true });
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = () => {
    if (dismissible) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className={`group min-w-site-min fixed inset-0 m-0 h-full max-h-none
        w-full max-w-none overflow-y-auto p-0 text-slate-50
        backdrop:bg-transparent ${dialogClasses}`}
    >
      <div
        className={layout}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        {panel ? (
          <div ref={panelRef} tabIndex={-1} className={panel}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    </dialog>
  );
};

export default Dialog;
