import { RequestNewEmailVerificationLinkForm } from "@/app/profile/accountManagement/requestNewEmailVerificationLink/RequestNewEmailVerificationLinkForm";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata("profile");

const RequestNewEmailVerificationLink = async () => {
  await requireBffSessionUser();

  return (
    <div className="mx-4 py-8">
      <RequestNewEmailVerificationLinkForm />
    </div>
  );
};

export default RequestNewEmailVerificationLink;
