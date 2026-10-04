import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import OpenGmailButton from "@/app/ui/OpenGmailButton";

export const metadata = pageMetadata("profile");

export const instant = false;

const RequestNewEmailVerificationLinkSuccess = async () => {
  await requireBffSessionUser();

  return (
    <PageColumn className="flex flex-col gap-2">
      <div>
        A new verification email has been sent! Be sure to check your junk or
        spam folders.
      </div>
      <div>
        <OpenGmailButton centerText={true} />
      </div>
    </PageColumn>
  );
};

export default RequestNewEmailVerificationLinkSuccess;
