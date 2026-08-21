import { RequestNewEmailVerificationLinkForm } from "@/app/profile/accountManagement/requestNewEmailVerificationLink/RequestNewEmailVerificationLinkForm";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { redirect } from "next/navigation";

const RequestNewEmailVerificationLink = async () => {
  const user = await getBffSessionUser();
  if (!user) redirect("/signin");

  return (
    <div className="mx-4 py-8">
      <RequestNewEmailVerificationLinkForm />
    </div>
  );
};

export default RequestNewEmailVerificationLink;
