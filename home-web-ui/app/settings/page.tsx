import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";

const Settings = async () => {
  await requireBffSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Settings</div>
    </div>
  );
};

export default Settings;
