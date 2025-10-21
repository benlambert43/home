import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CreateAccountForm } from "@/app/createaccount/CreateAccountForm";

const CreateAccount = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value === "string") redirect("/profile");

  return (
    <div className="mx-4 py-8">
      <div>
        <CreateAccountForm />
      </div>
    </div>
  );
};

export default CreateAccount;
