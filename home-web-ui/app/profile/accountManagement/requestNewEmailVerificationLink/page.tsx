import { RequestNewEmailVerificationLinkForm } from "@/app/profile/accountManagement/requestNewEmailVerificationLink/RequestNewEmailVerificationLinkForm";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";

const RequestNewEmailVerificationLink = async () => {
  await requireBffSessionUser();

  return (
    <div className="mx-4 py-8">
      <RequestNewEmailVerificationLinkForm />
    </div>
  );
};

export default RequestNewEmailVerificationLink;
