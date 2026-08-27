import OpenGmailButton from "@/app/ui/OpenGmailButton";
import Link from "next/link";

const ForgotPasswordSuccess = () => (
  <div className="flex flex-col gap-4 p-5">
    <div className="text-4xl font-bold">Check Your Email</div>
    <div>
      If an account exists for that email, a password reset link is on its way.
      Be sure to check your junk or spam folders.
    </div>
    <div>
      <OpenGmailButton />
    </div>
    <div className="mt-4">
      <Link href="/signin" className="underline">
        Back to Sign In
      </Link>
    </div>
  </div>
);

export default ForgotPasswordSuccess;
