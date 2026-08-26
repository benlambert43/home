import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import OpenGmailButton from "@/app/ui/OpenGmailButton";

const RequestNewEmailVerificationLinkSuccess = async () => {
  await requireBffSessionUser();

  return (
    <div className="mx-4 flex flex-col gap-2 py-8">
      <div>
        A new verification email has been sent! Be sure to check your junk or
        spam folders.
      </div>
      <OpenGmailButton centerText={true} />
    </div>
  );
};

export default RequestNewEmailVerificationLinkSuccess;
