import { redirect } from "next/navigation";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";

const Settings = async () => {
  const user = await getBffSessionUser();
  if (!user) redirect("/signin");

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Settings</div>
    </div>
  );
};

export default Settings;
