import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import OpenGmailButton from "@/app/ui/OpenGmailButton";
import Link from "next/link";

export const metadata = pageMetadata("forgot password");

const ForgotPasswordSuccess = () => (
  <PageColumn className="flex flex-col gap-4">
    <h1 className="text-4xl font-bold">Check Your Email</h1>
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
  </PageColumn>
);

export default ForgotPasswordSuccess;
