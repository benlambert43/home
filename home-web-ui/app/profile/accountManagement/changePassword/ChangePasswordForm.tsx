"use client";

import { changePassword } from "@/app/actions/profile";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { useActionState } from "react";

const ChangePasswordForm = () => {
  const [state, action, pending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        name="currentPassword"
        label="Current Password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your current password"
      />

      <FieldError errors={state?.properties?.currentPassword?.errors} />

      <TextField
        name="newPassword"
        label="New Password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your new password"
      />

      <FieldError errors={state?.properties?.newPassword?.errors} />

      <TextField
        name="confirmNewPassword"
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your new password again"
      />

      <FieldError errors={state?.properties?.confirmNewPassword?.errors} />

      <div className="mt-4 flex flex-col items-start justify-center gap-2">
        <Button size="large" disabled={pending} type="submit">
          Change Password
        </Button>
      </div>

      <FieldError errors={state?.errors} />
    </form>
  );
};

export default ChangePasswordForm;
