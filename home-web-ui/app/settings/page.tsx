import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Settings = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value !== "string") redirect("/signin");
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Settings</div>
    </div>
  );
};

export default Settings;
