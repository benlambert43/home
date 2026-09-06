"use client";

import { hasFormErrors, SubmittedFormErrors } from "@/app/lib/forms";
import { CAPTCHA_PUBLIC } from "@/app/lib/publicEnv";
import { useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const Captcha = ({ state }: { state: SubmittedFormErrors | undefined }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    if (hasFormErrors(state)) recaptchaRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col items-start justify-center gap-2">
      <ReCAPTCHA
        id="publicCaptcha"
        sitekey={CAPTCHA_PUBLIC}
        ref={recaptchaRef}
      />
    </div>
  );
};

export default Captcha;
