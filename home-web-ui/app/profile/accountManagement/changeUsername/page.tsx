import ChangeUsernameForm from "@/app/profile/accountManagement/changeUsername/ChangeUsernameForm";
import { UserCookie } from "@/app/types/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ChangeUsername = async () => {
  const cookieStore = await cookies();
  const maybeUserCookie = cookieStore.get("user");
  if (typeof maybeUserCookie?.value !== "string") redirect("/signin");
  const userCookie = JSON.parse(maybeUserCookie.value) as UserCookie;

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Change Username</div>
      <div>Current username: {userCookie.username}</div>
      <div>
        <ChangeUsernameForm userCookie={userCookie} />
      </div>
    </div>
  );
};

export default ChangeUsername;
