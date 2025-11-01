"use client";

import { createAccount } from "@/app/actions/auth";
import { useActionState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export const CreateAccountForm = () => {
  const publicCaptchaKey = process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC || "";
  const [state, action, pending] = useActionState(createAccount, undefined);

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
          />
        </div>
      </div>
      <div>
        {state?.properties?.firstname?.errors && (
          <p>{state?.properties?.firstname?.errors}</p>
        )}
        {state?.properties?.lastname?.errors && (
          <p>{state?.properties?.lastname?.errors}</p>
        )}
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
        />
      </div>
      <div>
        {state?.properties?.email?.errors && (
          <p>{state?.properties?.email?.errors}</p>
        )}
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
        {state?.properties?.password?.errors && (
          <p>{state?.properties?.password?.errors}</p>
        )}
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
        {state?.properties?.confirmPassword?.errors && (
          <div>
            {state?.properties?.confirmPassword?.errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <ReCAPTCHA id="publicCaptcha" sitekey={publicCaptchaKey} />
      </div>
      {state?.properties?.grecaptcharesponse?.errors && (
        <p>{state?.properties?.grecaptcharesponse?.errors}</p>
      )}
      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <button
          disabled={pending}
          type="submit"
          className="w-1/2 max-w-80 min-w-fit rounded-xl bg-slate-500 px-4 py-2
            outline-1 outline-slate-400 focus:outline-slate-50"
        >
          Create Account
        </button>
      </div>
      <div>{state?.errors?.toString()}</div>
    </form>
  );
};
