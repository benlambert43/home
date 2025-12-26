"use client";

import { requestNewEmailVerificationLinkAction } from "@/app/actions/auth";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { redirect } from "next/navigation";
import { useActionState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export const RequestNewEmailVerificationLinkForm = ({
  props,
}: {
  props: { userCookie: RequestCookie | undefined };
}) => {
  const publicCaptchaKey = process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC || "";
  const [state, action, pending] = useActionState(
    requestNewEmailVerificationLinkAction,
    undefined,
  );

  useEffect(() => {
    if (typeof props.userCookie?.value !== "string") {
      const signInReferral = localStorage.setItem(
        "signInReferral",
        "/profile/accountManagement/requestNewEmailVerificationLink",
      );
      console.log(signInReferral);
      redirect("/signin");
    }
  }, []);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col items-start justify-center gap-2">
        <ReCAPTCHA id="publicCaptcha" sitekey={publicCaptchaKey} />
      </div>
      {state?.properties?.grecaptcharesponse?.errors && (
        <p>{state?.properties?.grecaptcharesponse?.errors}</p>
      )}

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
      <div>{state?.errors?.toString()}</div>
    </form>
  );
};
