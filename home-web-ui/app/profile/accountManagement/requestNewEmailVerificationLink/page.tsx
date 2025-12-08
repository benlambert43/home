import { RequestNewEmailVerificationLinkForm } from "@/app/profile/accountManagement/requestNewEmailVerificationLink/RequestNewEmailVerificationLinkForm";

const RequestNewEmailVerificationLink = async () => {
  return (
    <div className="mx-4 py-8">
      <RequestNewEmailVerificationLinkForm />
    </div>
  );
};

export default RequestNewEmailVerificationLink;
