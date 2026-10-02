import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { pageMetadata } from "@/app/lib/metadata";
import { paramFilled, SearchParams } from "@/app/lib/searchParams";
import VerificationComplete from "@/app/profile/accountManagement/verifyEmail/VerificationComplete";
import VerificationProblem from "@/app/profile/accountManagement/verifyEmail/VerificationProblem";
import { redirect } from "next/navigation";

export const metadata = pageMetadata("profile");

export const instant = false;

const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const user = await getBffSessionUser();
  if (user?._id && user.confirmedEmail === true) {
    redirect("/profile");
  }

  const { code } = await searchParams;

  if (!paramFilled(code)) {
    return <VerificationProblem headline="Missing verification code." />;
  }

  return <VerificationComplete code={code} />;
};

export default VerifyEmail;
