"use client";

import { deletePost } from "@/app/actions/posts";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import { useState, useTransition } from "react";

const DeletePostButton = ({
  postId,
  page,
}: {
  postId: string;
  page: number;
}) => {
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
      const result = await deletePost(postId, page);
      setErrors(result?.errors);
    });
  };

  return (
    <>
      <Button type="button" size="small" color="danger" onClick={open}>
        Delete
      </Button>

      <ConfirmationModal
        open={confirming}
        title="Delete post?"
        confirmLabel={pending ? "Deleting..." : "Delete"}
        confirmColor="danger"
        pending={pending}
        onConfirm={confirm}
        onCancel={close}
      >
        This post, its images, and every earlier revision will be permanently
        deleted. This cannot be undone.
        <FieldError errors={errors} />
      </ConfirmationModal>
    </>
  );
};

export default DeletePostButton;
