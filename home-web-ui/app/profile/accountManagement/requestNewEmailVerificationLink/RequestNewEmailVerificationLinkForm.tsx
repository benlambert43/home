"use client";

import { requestNewEmailVerificationLink } from "@/app/actions/auth";
import Button from "@/app/ui/Button";
import FieldError from "@/app/ui/FieldError";
import { useActionState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export const RequestNewEmailVerificationLinkForm = () => {
  const publicCaptchaKey = process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC || "";
  const [state, action, pending] = useActionState(
    requestNewEmailVerificationLink,
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
