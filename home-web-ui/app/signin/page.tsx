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
      <Link href="/createaccount">create account</Link>
    </div>
  );
};

export default SignIn;
