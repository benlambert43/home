import { RequestNewEmailVerificationLinkForm } from "@/app/profile/accountManagement/requestNewEmailVerificationLink/RequestNewEmailVerificationLinkForm";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata("profile");

export const instant = false;

const RequestNewEmailVerificationLink = async () => {
  await requireBffSessionUser(
    "/profile/accountManagement/requestNewEmailVerificationLink",
  );

  return (
    <PageColumn>
      <RequestNewEmailVerificationLinkForm />
    </PageColumn>
  );
};

export default RequestNewEmailVerificationLink;
