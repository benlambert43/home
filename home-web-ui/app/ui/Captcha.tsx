"use client";

import { hasFormErrors, SubmittedFormErrors } from "@/app/lib/forms";
import { CAPTCHA_PUBLIC } from "@/app/lib/publicEnv";
import CaptchaConsent from "@/app/ui/CaptchaConsent";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const Captcha = ({ state }: { state: SubmittedFormErrors | undefined }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (hasFormErrors(state)) recaptchaRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col items-start justify-center gap-2">
      {accepted ? (
        <ReCAPTCHA
          id="publicCaptcha"
          sitekey={CAPTCHA_PUBLIC}
          ref={recaptchaRef}
        />
      ) : (
        <CaptchaConsent onAccept={() => setAccepted(true)} />
      )}
    </div>
  );
};

export default Captcha;
