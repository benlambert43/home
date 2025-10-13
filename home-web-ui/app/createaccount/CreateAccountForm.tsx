import { createAccount } from "@/app/actions/auth";

export const CreateAccountForm = () => {
  return (
    <form action={createAccount} className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="name">Name</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400"
          id="name"
          name="name"
          placeholder="Name"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="email">Email</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400"
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
            outline-slate-400"
          id="password"
          name="password"
          type="password"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <button type="submit">Create Account</button>
      </div>
    </form>
  );
};
