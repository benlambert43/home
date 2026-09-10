import ChangeUsernameForm from "@/app/profile/accountManagement/changeUsername/ChangeUsernameForm";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";

const ChangeUsername = async () => {
  const user = await requireBffSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-4xl font-bold">Change Username</h1>
      <div>Current username: {user.username}</div>
      <div>
        <ChangeUsernameForm />
      </div>
    </div>
  );
};

export default ChangeUsername;
