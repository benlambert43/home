"use client";

import { requestNewEmailVerificationLink } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import Captcha from "@/app/ui/Captcha";
import FieldError from "@/app/ui/FieldError";
import { useActionState } from "react";

export const RequestNewEmailVerificationLinkForm = () => {
  const [state, action, pending] = useActionState(
    requestNewEmailVerificationLink,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        First complete the captcha, then click the button to receive a new link.
      </div>
      <Captcha state={state} />
      <FieldError errors={state?.properties?.grecaptcharesponse?.errors} />

      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <Button size="large" disabled={pending} type="submit">
          Send Me a New Email Verification Link
        </Button>
      </div>
      <FieldError errors={state?.errors} />
    </form>
  );
};
