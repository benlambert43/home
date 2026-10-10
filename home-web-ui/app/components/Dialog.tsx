"use client";

import { ReactNode, useEffect, useRef } from "react";

type DialogPlacement = "center" | "start";

const PLACEMENT_CLASSES: Record<DialogPlacement, string> = {
  center: "flex min-h-full items-center justify-center p-4",
  start: "flex min-h-full justify-start",
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
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
      className="group min-w-site-min fixed inset-0 m-0 h-full max-h-none w-full
        max-w-none overflow-y-auto bg-transparent p-0 text-slate-50 opacity-0
        transition-[opacity,display,overlay] transition-discrete duration-200
        backdrop:bg-slate-950/70 backdrop:opacity-0
        backdrop:transition-[opacity,display,overlay] backdrop:duration-200
        open:opacity-100 open:backdrop:opacity-100 starting:open:opacity-0
        starting:open:backdrop:opacity-0"
    >
      <div
        className={PLACEMENT_CLASSES[placement]}
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        {children}
      </div>
    </dialog>
  );
};

export default Dialog;
