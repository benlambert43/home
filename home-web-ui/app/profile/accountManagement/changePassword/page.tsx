import { checkPasswordResetLink } from "@/app/actions/auth";
import { requireBffSessionUser } from "@/app/auth/requireBffSessionUser";
import { errorMessage } from "@/app/lib/api";
import ChangePasswordForm from "@/app/profile/accountManagement/changePassword/ChangePasswordForm";
import ResetLinkProblem from "@/app/profile/accountManagement/changePassword/ResetLinkProblem";
import ResetPasswordForm from "@/app/profile/accountManagement/changePassword/ResetPasswordForm";
import { CheckPasswordResetLinkResponse } from "@home/shared";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const paramFilled = (value: string | string[] | undefined): value is string =>
  typeof value === "string" && value.length > 0;

const ResetPassword = async ({ code }: { code: string }) => {
  let linkStatus: CheckPasswordResetLinkResponse;

  try {
    linkStatus = await checkPasswordResetLink(code);
  } catch (e) {
    return (
      <ResetLinkProblem
        headline="An error occurred. Unable to reach the password reset service."
        detail={errorMessage(e)}
      />
    );
  }

  if (linkStatus.error) {
    return <ResetLinkProblem headline={linkStatus.message} />;
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Choose a New Password</div>
      <div>Pick a new password, then sign in with it.</div>
      <div>
        <ResetPasswordForm code={code} />
      </div>
    </div>
  );
};

const ChangePassword = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}) => {
  const { code } = await searchParams;

  if (paramFilled(code)) return <ResetPassword code={code} />;

  await requireBffSessionUser();

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="text-4xl font-bold">Change Password</div>
      <div>Enter your current password, then choose a new one.</div>
      <div>
        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default ChangePassword;
