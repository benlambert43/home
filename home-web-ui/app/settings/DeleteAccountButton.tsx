"use client";

import { deleteAccount } from "@/app/actions/profile";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import { useState, useTransition } from "react";

const DeleteAccountButton = () => {
  const [confirming, setConfirming] = useState(false);
  const [errors, setErrors] = useState<string[]>();
  const [pending, startTransition] = useTransition();

  const open = () => {
    setErrors(undefined);
    setConfirming(true);
  };

  const close = () => setConfirming(false);

  const confirm = () => {
    startTransition(async () => {
      const result = await deleteAccount();
      setErrors(result?.errors);
    });
  };

  return (
    <>
      <Button type="button" size="small" color="danger" onClick={open}>
        Delete Account
      </Button>

      <ConfirmationModal
        open={confirming}
        title="Delete account?"
        confirmLabel={pending ? "Deleting..." : "Delete"}
        confirmColor="danger"
        pending={pending}
        onConfirm={confirm}
        onCancel={close}
      >
        Your account and everything on it will be permanently deleted. This
        cannot be undone.
        <FieldError errors={errors} />
      </ConfirmationModal>
    </>
  );
};

export default DeleteAccountButton;
