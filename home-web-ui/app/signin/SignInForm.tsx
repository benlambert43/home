"use client";

import { signIn } from "@/app/actions/auth";
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
      <div>
        {state?.properties?.confirmPassword?.errors && (
          <p>{state?.properties?.confirmPassword?.errors}</p>
        )}
      </div>
      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <button
          disabled={pending}
          type="submit"
          className="w-1/2 max-w-80 min-w-fit rounded-xl bg-slate-500 px-4 py-2
            outline-1 outline-slate-400 focus:outline-slate-50"
        >
          Sign In
        </button>
      </div>
      <div>{state?.errors?.toString()}</div>
    </form>
  );
};
