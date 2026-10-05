import { logOut } from "@/app/actions/session";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import ProfileBanner from "@/app/profile/ProfileBanner";
import Button from "@/app/ui/Button";

export const metadata = pageMetadata("profile");

export const instant = false;

const Profile = async () => {
  const user = await requireBffSessionUser();

  return (
    <PageColumn className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Profile</h1>
      <div>
        <ProfileBanner user={user} />
      </div>
      <div className="flex flex-col gap-2">
        <b>Account Details:</b>
        <div>
          <p>First Name:</p>
          <p>{user.firstname}</p>
        </div>
        <div>
          <p>Last Name:</p>
          <p>{user.lastname}</p>
        </div>
        <div>
          <p>Email:</p>
          <p>{user.email}</p>
        </div>
        <div>
          <p>Email Verified:</p>
          <p>
            {user.confirmedEmail === true
              ? "✅ Verified"
              : "❌ Not yet verified."}
          </p>
        </div>
      </div>
      <div className="py-5">
        <form action={logOut}>
          <Button type="submit" size="large">
            Log Out
          </Button>
        </form>
      </div>
    </PageColumn>
  );
};

export default Profile;
