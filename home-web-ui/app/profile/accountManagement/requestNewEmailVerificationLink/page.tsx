import { RequestNewEmailVerificationLinkForm } from "@/app/profile/accountManagement/requestNewEmailVerificationLink/RequestNewEmailVerificationLinkForm";
import { requireSessionUser } from "@/app/auth/requireSessionUser";

const RequestNewEmailVerificationLink = async () => {
  await requireSessionUser();

  return (
    <div className="mx-4 py-8">
      <RequestNewEmailVerificationLinkForm />
    </div>
  );
};

export default RequestNewEmailVerificationLink;
