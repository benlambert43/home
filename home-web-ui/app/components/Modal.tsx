"use client";

import Dialog from "@/app/components/Dialog";
import { ReactNode, useId } from "react";

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
  const titleId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      dismissible={dismissible}
    >
      <div className="w-full max-w-md rounded-xl bg-slate-700 p-6 shadow-xl">
        <h2 id={titleId} className="text-xl font-semibold">
          {title}
        </h2>
        {children ? (
          <div className="pt-2 text-slate-300">{children}</div>
        ) : null}
        {actions ? (
          <div className="flex flex-wrap justify-end gap-2 pt-6">{actions}</div>
        ) : null}
      </div>
    </Dialog>
  );
};

export default Modal;
