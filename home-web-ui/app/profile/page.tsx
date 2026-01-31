import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { removeSession } from "@/app/actions/session";
import { UserCookie } from "@/app/types/types";
import Button from "@/app/ui/Button";

const Profile = async () => {
  const cookieStore = await cookies();
  const maybeUserCookie = cookieStore.get("user");
  if (typeof maybeUserCookie?.value !== "string") redirect("/signin");
  const userCookie = JSON.parse(maybeUserCookie.value) as UserCookie;

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Profile</div>
      <div className="text-xl">User Info:</div>
      <div className="flex flex-col gap-2 px-2">
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
          <p>{userCookie.confirmedEmail.toString()}</p>
        </div>
        <div>
          <p>Account Created:</p>
          <p>{new Date(userCookie.createdDate).toLocaleString().toString()}</p>
        </div>
        <div>
          <p>Account Last Modified:</p>
          <p>{new Date(userCookie.modifiedDate).toLocaleString().toString()}</p>
        </div>
        <div>
          <p>User Role:</p>
          <p>{userCookie.role.toString()}</p>
        </div>
      </div>

      <div>
        <Button onClick={removeSession}>Log Out</Button>
      </div>
    </div>
  );
};

export default Profile;
