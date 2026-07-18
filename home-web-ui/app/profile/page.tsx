import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { removeSession } from "@/app/actions/session";
import { UserCookie } from "@/app/types/types";
import ProfileBanner from "@/app/profile/ProfileBanner";
import Button from "@/app/ui/Button";

const Profile = async () => {
  const cookieStore = await cookies();
  const maybeUserCookie = cookieStore.get("user");
  if (typeof maybeUserCookie?.value !== "string") redirect("/signin");
  const userCookie = JSON.parse(maybeUserCookie.value) as UserCookie;

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Profile</div>
      <div>
        <ProfileBanner userCookie={userCookie} />
      </div>
      <div className="flex flex-col gap-2">
        <div>
          <p>First Name:</p>
          <p>{userCookie.firstname.toString()}</p>
        </div>
        <div>
          <p>Last Name:</p>
          <p>{userCookie.lastname.toString()}</p>
        </div>
        <div>
          <p>Email:</p>
          <p>{userCookie.email.toString()}</p>
        </div>
        <div>
          <p>Username:</p>
          <p>{userCookie.username.toString()}</p>
        </div>
        <div>
          <p>Email Verified:</p>
          <p>
            {userCookie.confirmedEmail === true
              ? "✅ Verified"
              : "❌ Not yet verified."}
          </p>
        </div>
      </div>

      <div className="py-5">
        <Button onClick={removeSession}>Log Out</Button>
      </div>
    </div>
  );
};

export default Profile;
