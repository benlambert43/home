import { requireSessionUser } from "@/app/auth/requireSessionUser";

const Settings = async () => {
  await requireSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Settings</div>
    </div>
  );
};

export default Settings;
