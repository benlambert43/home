"use client";

import { requestNewEmailVerificationLinkAction } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import { useActionState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export const RequestNewEmailVerificationLinkForm = () => {
  const publicCaptchaKey = process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC || "";
  const [state, action, pending] = useActionState(
    requestNewEmailVerificationLinkAction,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        First complete the captcha, then click the button to recieve a new link.
      </div>
      <div className="flex flex-col items-start justify-center gap-2">
        <ReCAPTCHA id="publicCaptcha" sitekey={publicCaptchaKey} />
      </div>
      {state?.properties?.grecaptcharesponse?.errors && (
        <p>{state?.properties?.grecaptcharesponse?.errors}</p>
      )}

      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <Button disabled={pending} type="submit">
          Send Me a New Email Verification Link
        </Button>
      </div>
      <div>{state?.errors?.toString()}</div>
    </form>
  );
};
