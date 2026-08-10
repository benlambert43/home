"use client";

import { changeUsername } from "@/app/actions/profile";
import { UserCookie } from "@/app/types/types";
import Button from "@/app/ui/Button";
import { useActionState } from "react";

const ChangeUsernameForm = (props: { userCookie: UserCookie }) => {
  const { userCookie } = props;

  const [state, action, pending] = useActionState(changeUsername, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-center gap-2">
        <label htmlFor="newUsername">newUsername</label>
        <input
          className="w-full max-w-160 rounded-xl px-4 py-2 outline-1
            outline-slate-400 focus:outline-slate-50"
          autoComplete="newUsername"
          id="newUsername"
          name="newUsername"
          type="newUsername"
          placeholder="newUsername"
          defaultValue={state?.values?.newUsername}
        />
      </div>

      {state?.properties?.newUsername?.errors && (
        <div>
          <div>
            {state?.properties?.newUsername?.errors?.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col items-start justify-center gap-2">
        <Button size="large" disabled={pending} type="submit">
          Change Username
        </Button>
      </div>
      <div>{state?.errors?.toString()}</div>
    </form>
  );
};
export default ChangeUsernameForm;
