import { redirectSignedInUser } from "@/app/auth/redirectSignedInUser";
import { CreateAccountForm } from "@/app/createaccount/CreateAccountForm";

const CreateAccount = async () => {
  await redirectSignedInUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-4xl font-bold">Create Account</h1>
      <CreateAccountForm />
    </div>
  );
};

export default CreateAccount;
