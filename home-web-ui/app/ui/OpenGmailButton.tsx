import Button from "@/app/ui/Button";
import { EnvelopeIcon } from "@heroicons/react/16/solid";

const GMAIL_URL = "https://mail.google.com";

const OpenGmailButton = ({ centerText }: { centerText?: boolean }) => (
  <Button
    type="link"
    linkProps={{
      href: GMAIL_URL,
      target: "_blank",
      rel: "noopener noreferrer",
    }}
    size="small"
  >
    <div
      className={`flex flex-row items-center
        ${centerText ? "justify-center" : undefined} gap-1`}
    >
      <EnvelopeIcon className="size-6" />
      Open Gmail
    </div>
  </Button>
);

export default OpenGmailButton;
