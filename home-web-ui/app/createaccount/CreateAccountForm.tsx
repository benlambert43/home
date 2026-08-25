"use client";

import { createAccount } from "@/app/actions/auth";
import { CreateAccountFormState } from "@/app/lib/definitions";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { useActionState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const hasFormErrors = (state: CreateAccountFormState): boolean => {
  if (!state) return false;
  if (state.errors.length > 0) return true;
  return (state.properties ? Object.values(state.properties) : []).some(
    (field) => Boolean(field?.errors.length),
  );
};

export const CreateAccountForm = () => {
  const publicCaptchaKey = process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC || "";
  const [state, action, pending] = useActionState(createAccount, undefined);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    if (hasFormErrors(state)) {
      recaptchaRef.current?.reset();
    }
  }, [state]);

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
      <div className="flex flex-col items-start justify-center gap-2">
        <ReCAPTCHA
          id="publicCaptcha"
          sitekey={publicCaptchaKey}
          ref={recaptchaRef}
        />
      </div>
      <FieldError errors={state?.properties?.grecaptcharesponse?.errors} />
      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <Button size="large" disabled={pending} type="submit">
          Create Account
        </Button>
      </div>
      <FieldError errors={state?.errors} />
    </form>
  );
};
