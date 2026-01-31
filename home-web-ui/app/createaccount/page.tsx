import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreateAccountForm } from "@/app/createaccount/CreateAccountForm";

const CreateAccount = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value === "string") redirect("/profile");

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Create Account</div>
      <CreateAccountForm />
    </div>
  );
};

export default CreateAccount;
