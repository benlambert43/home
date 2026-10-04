import { redirectSignedInUser } from "@/app/auth/redirectSignedInUser";
import PageColumn from "@/app/components/PageColumn";
import { CreateAccountForm } from "@/app/createaccount/CreateAccountForm";
import { pageMetadata } from "@/app/lib/metadata";

export const metadata = pageMetadata("create account");

export const instant = false;

const CreateAccount = async () => {
  await redirectSignedInUser();

  return (
    <PageColumn className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Create Account</h1>
      <CreateAccountForm />
    </PageColumn>
  );
};

export default CreateAccount;
