"use client";

import { signIn } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { useActionState } from "react";

export const SignInForm = () => {
  const [state, action, pending] = useActionState(signIn, undefined);

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

      <TextField
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
      />

      <FieldError errors={state?.properties?.password?.errors} />

      <FieldError errors={state?.errors} />

      <div className="mt-4 flex flex-col items-start justify-center gap-2">
        <Button size="large" disabled={pending} type="submit">
          Sign In
        </Button>
      </div>
    </form>
  );
};
