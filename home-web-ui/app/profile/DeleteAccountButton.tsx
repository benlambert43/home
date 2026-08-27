"use client";

import ConfirmationModal from "@/app/components/ConfirmationModal";
import Button from "@/app/ui/Button";
import { useState } from "react";

const DeleteAccountButton = () => {
  const [confirming, setConfirming] = useState(false);
  const close = () => setConfirming(false);

  return (
    <>
      <Button
        type="button"
        size="small"
        color="danger"
        onClick={() => setConfirming(true)}
      >
        Delete Account
      </Button>

      <ConfirmationModal
        open={confirming}
        title="Delete account?"
        confirmLabel="Delete"
        confirmColor="danger"
        onConfirm={close}
        onCancel={close}
      >
        Your account and everything on it will be permanently deleted. This
        cannot be undone.
      </ConfirmationModal>
    </>
  );
};

export default DeleteAccountButton;
