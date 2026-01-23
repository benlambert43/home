import { SignInForm } from "@/app/signin/SignInForm";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const SignIn = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value === "string") redirect("/profile");

  return (
    <div className="mx-4 py-8">
      <div>
        <SignInForm />
      </div>
      <div className="mt-4">
        <Link href="/createaccount" className="underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default SignIn;
