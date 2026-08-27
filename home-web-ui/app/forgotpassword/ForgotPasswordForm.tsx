"use client";

import { requestPasswordReset } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import Captcha from "@/app/ui/Captcha";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { useActionState } from "react";

export const ForgotPasswordForm = () => {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Email"
        defaultValue={state?.values?.email}
      />

      <FieldError errors={state?.properties?.email?.errors} />

      <Captcha state={state} />
      <FieldError errors={state?.properties?.grecaptcharesponse?.errors} />

      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <Button size="large" disabled={pending} type="submit">
          Send Me a Password Reset Link
        </Button>
      </div>

      <FieldError errors={state?.errors} />
    </form>
  );
};
