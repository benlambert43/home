import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { removeSession } from "@/app/actions/session";

const Profile = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value !== "string") redirect("/signin");

  return (
    <div className="p-5">
      <div>{userCookie.value}</div>
      <div>Profile</div>
      <div>
        <button onClick={removeSession}>log out</button>
      </div>
    </div>
  );
};

export default Profile;
