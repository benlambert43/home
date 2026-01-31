import { SignInForm } from "@/app/signin/SignInForm";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

const SignIn = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value === "string") redirect("/profile");

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Sign In</div>
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
