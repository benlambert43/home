import { redirect } from "next/navigation";
import { removeSession } from "@/app/actions/session";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import ProfileBanner from "@/app/profile/ProfileBanner";
import Button from "@/app/ui/Button";

const Profile = async () => {
  const user = await getBffSessionUser();
  if (!user) redirect("/signin");

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Profile</div>
      <div>
        <ProfileBanner user={user} />
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <p>First Name:</p>
          <p>{user.firstname.toString()}</p>
        </div>
        <div>
          <p>Last Name:</p>
          <p>{user.lastname.toString()}</p>
        </div>
        <div>
          <p>Email:</p>
          <p>{user.email.toString()}</p>
        </div>
        <div>
          <p>Username:</p>
          <p>{user.username.toString()}</p>
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

      <div className="py-5">
        <Button size="large" onClick={removeSession}>
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
