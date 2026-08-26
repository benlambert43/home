import { removeSession } from "@/app/actions/session";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import ProfileBanner from "@/app/profile/ProfileBanner";
import Button from "@/app/ui/Button";

const Profile = async () => {
  const user = await requireBffSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Profile</div>
      <div>
        <ProfileBanner user={user} />
      </div>
      <div className="flex flex-col gap-2">
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
          <p>Username:</p>
          <p>{user.username}</p>
          <Button
            type="link"
            linkProps={{ href: "/profile/accountManagement/changeUsername" }}
            size="small"
          >
            Change Username
          </Button>
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

      <form action={removeSession}>
        <Button type="submit" size="small" color="danger">
          Delete Account
        </Button>
      </form>

      <div className="py-5">
        <form action={removeSession}>
          <Button type="submit" size="large">
            Log Out
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
