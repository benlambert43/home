import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { removeSession } from "@/app/actions/session";
import { UserCookie } from "@/app/types/types";

const Profile = async () => {
  const cookieStore = await cookies();
  const maybeUserCookie = cookieStore.get("user");
  if (typeof maybeUserCookie?.value !== "string") redirect("/signin");
  const userCookie = JSON.parse(maybeUserCookie.value) as UserCookie;

  return (
    <div className="p-5">
      <div>Profile</div>
      <div>{userCookie._id.toString()}</div>
      <div>{userCookie.confirmedEmail.toString()}</div>
      <div>{userCookie.createdDate.toString()}</div>
      <div>{userCookie.email.toString()}</div>
      <div>{userCookie.expiresAt.toString()}</div>
      <div>{userCookie.firstname.toString()}</div>
      <div>{userCookie.issuedAt.toString()}</div>
      <div>{userCookie.lastname.toString()}</div>
      <div>{userCookie.loginAt.toString()}</div>
      <div>{userCookie.modifiedDate.toString()}</div>
      <div>{userCookie.role.toString()}</div>
      <div>{userCookie.userBanned.toString()}</div>
      <div>{userCookie.username.toString()}</div>

      <div>
        <button onClick={removeSession}>log out</button>
      </div>
    </div>
  );
};

export default Profile;
