import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import { pageMetadata } from "@/app/lib/metadata";
import Button from "@/app/ui/Button";

export const metadata = pageMetadata("settings");

const Settings = async () => {
  const user = await requireBffSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
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
    </div>
  );
};

export default Settings;
