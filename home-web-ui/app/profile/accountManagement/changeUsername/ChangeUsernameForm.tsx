"use client";

import { changeUsername } from "@/app/actions/profile";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { useActionState } from "react";

const ChangeUsernameForm = () => {
  const [state, action, pending] = useActionState(changeUsername, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        name="newUsername"
        label="New Username"
        type="text"
        autoComplete="username"
        placeholder="New Username"
        defaultValue={state?.values?.newUsername}
      />

      <FieldError errors={state?.properties?.newUsername?.errors} />

      <div className="mt-4 flex flex-col items-start justify-center gap-2">
        <Button size="large" disabled={pending} type="submit">
          Change Username
        </Button>
      </div>
      <FieldError errors={state?.errors} />
    </form>
  );
};
export default ChangeUsernameForm;
