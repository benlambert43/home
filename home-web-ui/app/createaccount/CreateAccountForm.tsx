"use client";

import {
  ACCOUNTS_AND_EMAIL,
  PRIVACY_NOTICE,
  TERMS_OF_USE,
} from "@/app/about/notices";
import { createAccount } from "@/app/actions/auth";
import {
  MARKETING_CONSENT_LABEL,
  NEWSLETTER_CONSENT_LABEL,
} from "@/app/lib/emailConsent";
import Button from "@/app/ui/Button";
import Captcha from "@/app/ui/Captcha";
import Checkbox from "@/app/ui/Checkbox";
import FieldError from "@/app/ui/FieldError";
import TextField from "@/app/ui/TextField";
import { CHECKBOX_CHECKED_VALUE } from "@home/shared";
import Link from "next/link";
import { useActionState } from "react";

export const CreateAccountForm = () => {
  const [state, action, pending] = useActionState(createAccount, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap items-center justify-start gap-4">
        <TextField
          name="firstname"
          label="First Name"
          width="paired"
          autoComplete="given-name"
          placeholder="First Name"
          defaultValue={state?.values?.firstname}
        />
        <TextField
          name="lastname"
          label="Last Name"
          width="paired"
          autoComplete="family-name"
          placeholder="Last Name"
          defaultValue={state?.values?.lastname}
        />
      </div>
      <div>
        <FieldError errors={state?.properties?.firstname?.errors} />
        <FieldError errors={state?.properties?.lastname?.errors} />
      </div>
      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Email"
        defaultValue={state?.values?.email}
      />
      <div>
        <FieldError errors={state?.properties?.email?.errors} />
      </div>
      <TextField
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your password"
      />
      <div>
        <FieldError errors={state?.properties?.password?.errors} />
      </div>
      <TextField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your password again"
      />
      <div>
        <FieldError errors={state?.properties?.confirmPassword?.errors} />
      </div>
      <Captcha state={state} />
      <FieldError errors={state?.properties?.grecaptcharesponse?.errors} />
      <fieldset className="flex max-w-160 flex-col gap-3">
        <legend className="pb-2">Consent</legend>
        <p className="text-sm text-slate-400">
          Only agreeing to the {TERMS_OF_USE.title} is required to create an
          account. Newsletter emails and product and marketing emails are
          optional.
        </p>
        <Checkbox
          name="termsConsent"
          requirement="required"
          defaultChecked={
            state?.values?.termsConsent === CHECKBOX_CHECKED_VALUE
          }
        >
          I agree to the{" "}
          <Link href={TERMS_OF_USE.href} className="underline">
            {TERMS_OF_USE.title}
          </Link>{" "}
          and acknowledge the{" "}
          <Link href={PRIVACY_NOTICE.href} className="underline">
            {PRIVACY_NOTICE.title}
          </Link>
          . This includes receiving essential emails from the site: updates to
          its notices and urgent notices about my account, as described in{" "}
          <Link href={ACCOUNTS_AND_EMAIL.href} className="underline">
            {ACCOUNTS_AND_EMAIL.title}
          </Link>
          .
        </Checkbox>
        <FieldError errors={state?.properties?.termsConsent?.errors} />
        <Checkbox
          name="newsletterConsent"
          requirement="optional"
          defaultChecked={
            state?.values?.newsletterConsent === CHECKBOX_CHECKED_VALUE
          }
        >
          {NEWSLETTER_CONSENT_LABEL}
        </Checkbox>
        <Checkbox
          name="marketingConsent"
          requirement="optional"
          defaultChecked={
            state?.values?.marketingConsent === CHECKBOX_CHECKED_VALUE
          }
        >
          {MARKETING_CONSENT_LABEL}
        </Checkbox>
      </fieldset>
      <div className="flex flex-col items-start justify-center gap-2 py-6">
        <Button size="large" disabled={pending} type="submit">
          Create Account
        </Button>
      </div>
      <FieldError errors={state?.errors} />
    </form>
  );
};
