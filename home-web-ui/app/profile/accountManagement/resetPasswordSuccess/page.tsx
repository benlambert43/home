import Button from "@/app/ui/Button";

const ResetPasswordSuccess = () => (
  <div className="flex flex-col gap-4 p-5">
    <div className="text-4xl font-bold">Password Changed</div>
    <div>Your password has been changed. Sign in with your new password.</div>
    <div className="py-5">
      <Button type="link" linkProps={{ href: "/signin" }} size="large">
        Sign In
      </Button>
    </div>
  </div>
);

export default ResetPasswordSuccess;
