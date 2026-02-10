"use client";

import { signIn } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import { useActionState } from "react";

export const SignInForm = () => {
  const [state, action, pending] = useActionState(signIn, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
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

      {state?.properties?.email?.errors && (
        <div>
          <p>{state?.properties?.email?.errors}</p>
        </div>
      )}

      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="password">Password</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400 focus:outline-slate-50"
          placeholder="Enter your password"
          id="password"
          name="password"
          type="password"
        />
      </div>

      {state?.properties?.password?.errors && (
        <div>
          <p>{state?.properties?.password?.errors}</p>
        </div>
      )}

      {state?.errors && (
        <div>
          <p>{state?.errors.toString()}</p>
        </div>
      )}

      <div className="mt-4 flex flex-col items-start justify-center gap-2">
        <Button disabled={pending} type="submit">
          Sign In
        </Button>
      </div>
    </form>
  );
};
