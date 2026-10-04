import ChangeUsernameForm from "@/app/profile/accountManagement/changeUsername/ChangeUsernameForm";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata("profile");

export const instant = false;

const ChangeUsername = async () => {
  const user = await requireBffSessionUser();

  return (
    <PageColumn className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Change Username</h1>
      <div>Current username: {user.username}</div>
      <div>
        <ChangeUsernameForm />
      </div>
    </PageColumn>
  );
};

export default ChangeUsername;
