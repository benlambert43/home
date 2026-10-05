import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import DeleteAccountButton from "@/app/settings/DeleteAccountButton";
import EmailConsentForm from "@/app/settings/EmailConsentForm";
import Button from "@/app/ui/Button";

export const metadata = pageMetadata("settings");

export const instant = false;

const Settings = async () => {
  const user = await requireBffSessionUser();

  return (
    <PageColumn className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Settings</h1>

      <EmailConsentForm
        saved={{
          newsletterConsent: user.newsletterConsent,
          marketingConsent: user.marketingConsent,
        }}
      />

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

      <div className="flex flex-col gap-2">
        <b>Account Options:</b>
        <div>
          <DeleteAccountButton />
        </div>
        <div>
          <Button
            type="link"
            linkProps={{ href: "/profile/accountManagement/changePassword" }}
            size="small"
          >
            Change Password
          </Button>
        </div>
      </div>
    </PageColumn>
  );
};

export default Settings;
