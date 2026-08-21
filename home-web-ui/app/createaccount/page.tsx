import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { redirect } from "next/navigation";
import { CreateAccountForm } from "@/app/createaccount/CreateAccountForm";

const CreateAccount = async () => {
  const user = await getBffSessionUser();
  if (user) redirect("/profile");

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Create Account</div>
      <CreateAccountForm />
    </div>
  );
};

export default CreateAccount;
