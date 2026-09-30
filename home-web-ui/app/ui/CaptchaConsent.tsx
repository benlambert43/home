import { COOKIE_NOTICE } from "@/app/about/notices";
import Button from "@/app/ui/Button";
import Link from "next/link";

const CaptchaConsent = ({ onAccept }: { onAccept: () => void }) => (
  <div
    className="flex max-w-76 flex-col items-start gap-3 rounded-xl bg-slate-700
      p-4 text-sm"
  >
    <p>
      This form uses Google reCAPTCHA, which sets cookies when it loads. The{" "}
      <Link href={COOKIE_NOTICE.href} className="underline">
        {COOKIE_NOTICE.title}
      </Link>{" "}
      explains them.
    </p>
    <Button type="button" size="small" onClick={onAccept}>
      Accept and Load reCAPTCHA
    </Button>
  </div>
);

export default CaptchaConsent;
