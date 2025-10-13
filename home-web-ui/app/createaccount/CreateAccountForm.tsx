import { createAccount } from "@/app/actions/auth";

export const CreateAccountForm = () => {
  return (
    <form action={createAccount} className="flex flex-col gap-6">
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
      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <button
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
