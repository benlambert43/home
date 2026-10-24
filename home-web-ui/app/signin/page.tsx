import { SignInForm } from "@/app/signin/SignInForm";
import { redirectSignedInUser } from "@/app/auth/redirectSignedInUser";
import { localReturnPath, RETURN_TO } from "@/app/auth/returnPath";
import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import { SearchParams } from "@/app/lib/searchParams";
import Link from "next/link";

export const metadata = pageMetadata("sign in");

export const instant = false;

const SignIn = async ({ searchParams }: { searchParams: SearchParams }) => {
  const returnTo = localReturnPath((await searchParams)[RETURN_TO]);
  await redirectSignedInUser(returnTo);

  return (
    <PageColumn className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Sign In</h1>
      <div>
        <SignInForm returnTo={returnTo} />
      </div>
      <div className="mt-4 flex flex-col items-start gap-2">
        <Link href="/createaccount" className="underline">
          Create Account
        </Link>
        <Link href="/forgotpassword" className="underline">
          Forgot Password?
        </Link>
      </div>
    </PageColumn>
  );
};

export default SignIn;
