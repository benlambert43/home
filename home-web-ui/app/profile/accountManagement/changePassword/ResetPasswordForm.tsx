"use client";

import { resetPassword } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { useActionState } from "react";

const ResetPasswordForm = ({ code }: { code: string }) => {
  const [state, action, pending] = useActionState(resetPassword, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="code" value={code} readOnly />

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
          Set New Password
        </Button>
      </div>

      <FieldError errors={state?.properties?.code?.errors} />
      <FieldError errors={state?.errors} />
    </form>
  );
};

export default ResetPasswordForm;
