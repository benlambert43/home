"use client";

import Modal from "@/app/components/Modal";
import Button, { ButtonColor } from "@/app/ui/Button";
import { ReactNode } from "react";

type ConfirmationModalProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: ButtonColor;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal = ({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "normal",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    dismissible={!pending}
    actions={
      <>
        <Button
          type="button"
          size="small"
          disabled={pending}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          size="small"
          color={confirmColor}
          disabled={pending}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </>
    }
  >
    {children}
  </Modal>
);

export default ConfirmationModal;
