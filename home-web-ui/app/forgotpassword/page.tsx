import { ForgotPasswordForm } from "@/app/forgotpassword/ForgotPasswordForm";
import { redirectSignedInUser } from "@/app/auth/redirectSignedInUser";
import { pageMetadata } from "@/app/lib/metadata";
import Link from "next/link";

export const metadata = pageMetadata("forgot password");

const ForgotPassword = async () => {
  await redirectSignedInUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <h1 className="text-4xl font-bold">Forgot Password</h1>
      <div>
        Enter the email address on your account and we will send you a link to
        choose a new password.
      </div>
      <div>
        <ForgotPasswordForm />
      </div>
      <div className="mt-4">
        <Link href="/signin" className="underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
