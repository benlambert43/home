"use client";

import { ReactNode, useEffect, useId, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  dismissible?: boolean;
};

const Modal = ({
  open,
  onClose,
  title,
  children,
  actions,
  dismissible = true,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none
        overflow-y-auto bg-transparent p-0 text-slate-50 opacity-0
        transition-[opacity,display,overlay] transition-discrete duration-200
        backdrop:bg-slate-950/70 backdrop:opacity-0
        backdrop:transition-[opacity,display,overlay] backdrop:duration-200
        open:opacity-100 open:backdrop:opacity-100 starting:open:opacity-0
        starting:open:backdrop:opacity-0"
    >
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        <div className="w-full max-w-md rounded-xl bg-slate-700 p-6 shadow-xl">
          <h2 id={titleId} className="text-xl font-semibold">
            {title}
          </h2>
          {children ? (
            <div className="pt-2 text-slate-300">{children}</div>
          ) : null}
          {actions ? (
            <div className="flex flex-wrap justify-end gap-2 pt-6">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
