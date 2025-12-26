import { cookies } from "next/headers";
import { RequestNewEmailVerificationLinkForm } from "@/app/profile/accountManagement/requestNewEmailVerificationLink/RequestNewEmailVerificationLinkForm";

const RequestNewEmailVerificationLink = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  return (
    <div className="mx-4 py-8">
      <RequestNewEmailVerificationLinkForm props={{ userCookie: userCookie }} />
    </div>
  );
};

export default RequestNewEmailVerificationLink;
