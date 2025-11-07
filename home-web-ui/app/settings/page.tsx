import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Settings = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value !== "string") redirect("/signin");
  return <div>Settings</div>;
};

export default Settings;
