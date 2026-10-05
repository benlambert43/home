"use client";

import { changeEmailConsent } from "@/app/actions/profile";
import {
  MARKETING_CONSENT_LABEL,
  NEWSLETTER_CONSENT_LABEL,
} from "@/app/lib/emailConsent";
import Button from "@/app/ui/Button";
import Checkbox from "@/app/ui/Checkbox";
import FieldError from "@/app/ui/FieldError";
import { UserNoPassword } from "@home/shared";
import { useState, useTransition } from "react";

type EmailConsent = Pick<
  UserNoPassword,
  "newsletterConsent" | "marketingConsent"
>;

const EmailConsentForm = ({ saved }: { saved: EmailConsent }) => {
  const [newsletterConsent, setNewsletterConsent] = useState(
    saved.newsletterConsent,
  );
  const [marketingConsent, setMarketingConsent] = useState(
    saved.marketingConsent,
  );
  const [errors, setErrors] = useState<string[]>();
  const [pending, startTransition] = useTransition();

  const changed =
    newsletterConsent !== saved.newsletterConsent ||
    marketingConsent !== saved.marketingConsent;

  const save = () => {
    startTransition(async () => {
      const result = await changeEmailConsent({
        newsletterConsent,
        marketingConsent,
      });
      setErrors(result?.errors);
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
          onChange={(event) => setNewsletterConsent(event.target.checked)}
        >
          {NEWSLETTER_CONSENT_LABEL}
        </Checkbox>
        <Checkbox
          name="marketingConsent"
          requirement="optional"
          checked={marketingConsent}
          onChange={(event) => setMarketingConsent(event.target.checked)}
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
