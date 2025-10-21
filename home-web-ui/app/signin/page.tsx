import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SignIn = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value === "string") redirect("/profile");

  return (
    <div>
      <div>SignIn</div>
      <div>Sign in form</div>
    </div>
  );
};

export default SignIn;
