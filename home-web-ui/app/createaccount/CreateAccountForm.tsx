"use client";

import { createAccount } from "@/app/actions/auth";
import { useActionState } from "react";

export const CreateAccountForm = () => {
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
        <label htmlFor="username">Display Name</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400 focus:outline-slate-50"
          id="username"
          name="username"
          placeholder="Display Name"
        />
      </div>
      <div>
        {state?.properties?.username?.errors && (
          <p>{state?.properties?.username?.errors}</p>
        )}
      </div>
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
          id="confirmPassword"
          name="confirmPassword"
          type="password"
        />
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
          Create Account
        </button>
      </div>
    </form>
  );
};
