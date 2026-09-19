import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import { pageMetadata } from "@/app/lib/metadata";
import OpenGmailButton from "@/app/ui/OpenGmailButton";

export const metadata = pageMetadata("profile");

const RequestNewEmailVerificationLinkSuccess = async () => {
  await requireBffSessionUser();

  return (
    <div className="mx-4 flex flex-col gap-2 py-8">
      <div>
        A new verification email has been sent! Be sure to check your junk or
        spam folders.
      </div>
      <div>
        <OpenGmailButton centerText={true} />
      </div>
    </div>
  );
};

export default RequestNewEmailVerificationLinkSuccess;
