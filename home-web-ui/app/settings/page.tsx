import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import Button from "@/app/ui/Button";

export const metadata = pageMetadata("settings");

export const instant = false;

const Settings = async () => {
  const user = await requireBffSessionUser();

  return (
    <PageColumn className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Settings</h1>

      <div className="flex flex-col gap-2">
        <div>
          <p>Username:</p>
          <p>{user.username}</p>
          <div className="py-4">
            <Button
              type="link"
              linkProps={{ href: "/profile/accountManagement/changeUsername" }}
              size="small"
            >
              Change Username
            </Button>
          </div>
        </div>
      </div>
    </PageColumn>
  );
};

export default Settings;
