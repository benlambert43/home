import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const requestNewEmailVerificationLinkSuccess = async () => {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  if (typeof userCookie?.value !== "string") redirect("/signin");

  return (
    <div className="mx-4 py-8">
      A new verification email has been sent! Be sure to check your junk or spam
      folders.{" "}
    </div>
  );
};

export default requestNewEmailVerificationLinkSuccess;
