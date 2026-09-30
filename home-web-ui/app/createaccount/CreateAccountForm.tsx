"use client";

import { PRIVACY_NOTICE, TERMS_OF_USE } from "@/app/about/notices";
import { createAccount } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import Captcha from "@/app/ui/Captcha";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import Link from "next/link";
import { useActionState } from "react";

export const CreateAccountForm = () => {
  const [state, action, pending] = useActionState(createAccount, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap items-center justify-start gap-4">
        <TextField
          name="firstname"
          label="First Name"
          width="paired"
          autoComplete="given-name"
          placeholder="First Name"
          defaultValue={state?.values?.firstname}
        />
        <TextField
          name="lastname"
          label="Last Name"
          width="paired"
          autoComplete="family-name"
          placeholder="Last Name"
          defaultValue={state?.values?.lastname}
        />
      </div>
      <div>
        <FieldError errors={state?.properties?.firstname?.errors} />
        <FieldError errors={state?.properties?.lastname?.errors} />
      </div>
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Email"
        defaultValue={state?.values?.email}
      />
      <div>
        <FieldError errors={state?.properties?.email?.errors} />
      </div>
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your password"
      />
      <div>
        <FieldError errors={state?.properties?.password?.errors} />
      </div>
      <TextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your password again"
      />
      <div>
        <FieldError errors={state?.properties?.confirmPassword?.errors} />
      </div>
      <Captcha state={state} />
      <FieldError errors={state?.properties?.grecaptcharesponse?.errors} />
      <p className="text-sm text-slate-400">
        By creating an account you agree to the{" "}
        <Link href={TERMS_OF_USE.href} className="underline">
          {TERMS_OF_USE.title}
        </Link>{" "}
        and acknowledge the{" "}
        <Link href={PRIVACY_NOTICE.href} className="underline">
          {PRIVACY_NOTICE.title}
        </Link>
        .
      </p>
      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <Button size="large" disabled={pending} type="submit">
          Create Account
        </Button>
      </div>
      <FieldError errors={state?.errors} />
    </form>
  );
};
