import { SignInForm } from "@/app/signin/SignInForm";
import { redirectSignedInUser } from "@/app/auth/redirectSignedInUser";
import Link from "next/link";

const SignIn = async () => {
  await redirectSignedInUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Sign In</div>
      <div>
        <SignInForm />
      </div>
      <div className="mt-4 flex flex-col items-start gap-2">
        <Link href="/createaccount" className="underline">
          Create Account
        </Link>
        <Link href="/forgotpassword" className="underline">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
