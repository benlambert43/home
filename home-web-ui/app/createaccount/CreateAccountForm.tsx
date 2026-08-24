"use client";

import { createAccount } from "@/app/actions/auth";
import { SignUpFormState } from "@/app/lib/definitions";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import { useActionState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const hasFormErrors = (state: SignUpFormState): boolean => {
  if (!state) return false;
  if (state.errors.length > 0) return true;
  const fields = state.properties ? Object.values(state.properties) : [];
  return fields.some((field) => Boolean(field?.errors.length));
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
        <div
          className="flex w-full max-w-78 flex-col items-start justify-center
            gap-2"
        >
          <label htmlFor="firstname">First Name</label>
          <input
            className="w-full max-w-78 rounded-xl px-4 py-2 outline-1
              outline-slate-400 focus:outline-slate-50"
            autoComplete="given-name"
            id="firstname"
            name="firstname"
            placeholder="First Name"
            defaultValue={state?.values?.firstname}
          />
        </div>
        <div
          className="flex w-full max-w-78 flex-col items-start justify-center
            gap-2"
        >
          <label htmlFor="lastname">Last Name</label>
          <input
            className="w-full max-w-78 rounded-xl px-4 py-2 outline-1
              outline-slate-400 focus:outline-slate-50"
            autoComplete="family-name"
            id="lastname"
            name="lastname"
            placeholder="Last Name"
            defaultValue={state?.values?.lastname}
          />
        </div>
      </div>
      <div>
        <FieldError errors={state?.properties?.firstname?.errors} />
        <FieldError errors={state?.properties?.lastname?.errors} />
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="email">Email</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400 focus:outline-slate-50"
          autoComplete="email"
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          defaultValue={state?.values?.email}
        />
      </div>
      <div>
        <FieldError errors={state?.properties?.email?.errors} />
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="password">Password</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400 focus:outline-slate-50"
          autoComplete="new-password"
          placeholder="Enter your password"
          id="password"
          name="password"
          type="password"
        />
      </div>
      <div>
        <FieldError errors={state?.properties?.password?.errors} />
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400 focus:outline-slate-50"
          autoComplete="new-password"
          placeholder="Enter your password again"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
        />
      </div>
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
