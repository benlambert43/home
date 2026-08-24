import { redirectSignedInUser } from "@/app/auth/redirectSignedInUser";
import { CreateAccountForm } from "@/app/createaccount/CreateAccountForm";

const CreateAccount = async () => {
  await redirectSignedInUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Create Account</div>
      <CreateAccountForm />
    </div>
  );
};

export default CreateAccount;
