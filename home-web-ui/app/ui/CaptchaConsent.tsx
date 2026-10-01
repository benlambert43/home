import { COOKIE_NOTICE, PRIVACY_NOTICE } from "@/app/about/notices";
import Button from "@/app/ui/Button";
import Link from "next/link";

const CaptchaConsent = ({ onAccept }: { onAccept: () => void }) => (
  <div
    className="flex max-w-76 flex-col items-start gap-3 rounded-xl bg-slate-700
      p-4 text-sm"
  >
    <p>
      This form uses Google reCAPTCHA to keep out automated programs. Loading it
      sets a cookie and lets Google collect information about your browser and
      device, your IP address, and how you interact with this page.
    </p>
    <p>
      The{" "}
      <Link href={PRIVACY_NOTICE.href} className="underline">
        {PRIVACY_NOTICE.title}
      </Link>{" "}
      and{" "}
      <Link href={COOKIE_NOTICE.href} className="underline">
        {COOKIE_NOTICE.title}
      </Link>{" "}
      explain what is collected and how it is used.
    </p>
    <Button type="button" size="small" onClick={onAccept}>
      Accept and Load reCAPTCHA
    </Button>
  </div>
);

export default CaptchaConsent;
