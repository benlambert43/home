"use client";

import { changeEmailConsent } from "@/app/actions/profile";
import {
  MARKETING_CONSENT_LABEL,
  NEWSLETTER_CONSENT_LABEL,
} from "@/app/lib/emailConsent";
import Button from "@/app/ui/Button";
import Checkbox from "@/app/ui/Checkbox";
import FieldError from "@/app/ui/FieldError";
import { ChangeEmailConsentRequestBody } from "@home/shared";
import { ChangeEvent, useRef, useState, useTransition } from "react";

const EmailConsentForm = ({
  saved,
}: {
  saved: ChangeEmailConsentRequestBody;
}) => {
  const [newsletterConsent, setNewsletterConsent] = useState(
    saved.newsletterConsent,
  );
  const [marketingConsent, setMarketingConsent] = useState(
    saved.marketingConsent,
  );
  const [errors, setErrors] = useState<string[]>();
  const [pending, startTransition] = useTransition();
  const firstCheckbox = useRef<HTMLInputElement>(null);

  const changed =
    newsletterConsent !== saved.newsletterConsent ||
    marketingConsent !== saved.marketingConsent;

  const change =
    (setConsent: (consent: boolean) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setErrors(undefined);
      setConsent(event.target.checked);
    };

  const save = () => {
    startTransition(async () => {
      const result = await changeEmailConsent({
        newsletterConsent,
        marketingConsent,
      });
      setErrors(result?.errors);
      if (!result) firstCheckbox.current?.focus();
    });
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">Optional emails</legend>
        <Checkbox
          name="newsletterConsent"
          requirement="optional"
          checked={newsletterConsent}
          onChange={change(setNewsletterConsent)}
          ref={firstCheckbox}
        >
          {NEWSLETTER_CONSENT_LABEL}
        </Checkbox>
        <Checkbox
          name="marketingConsent"
          requirement="optional"
          checked={marketingConsent}
          onChange={change(setMarketingConsent)}
        >
          {MARKETING_CONSENT_LABEL}
        </Checkbox>
      </fieldset>
      {changed && (
        <>
          <Button type="button" size="small" disabled={pending} onClick={save}>
            Save
          </Button>
          <FieldError errors={errors} />
        </>
      )}
    </div>
  );
};

export default EmailConsentForm;
