"use client";

import { signIn } from "@/app/actions/auth";
import { useActionState, useEffect, useState } from "react";

export const SignInForm = () => {
  const [state, action, pending] = useActionState(signIn, undefined);
  const [signInReferralState, setSignInReferralState] = useState<string>();
  useEffect(() => {
    // Get and set the signIn referral state from local storage.
    const signInReferral = localStorage.getItem("signInReferral");
    if (typeof signInReferral === "string") {
      setSignInReferralState(signInReferral);
    } else {
      setSignInReferralState(undefined);
    }

    // Remove the local storage object when the state is loaded in.
    // If the user refreshes the sign in page,
    // then the redirect information will be lost.
    // But that's okay, since the fallback sends them to the /profile route.
    if (signInReferralState) {
      localStorage.removeItem("signInReferral");
    }
  }, [signInReferralState]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-center gap-2">
        {signInReferralState ? (
          <input
            type="hidden"
            name="signInReferral"
            value={signInReferralState}
          />
        ) : undefined}

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
