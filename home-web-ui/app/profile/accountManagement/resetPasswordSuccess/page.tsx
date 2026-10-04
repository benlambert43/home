import PageColumn from "@/app/components/PageColumn";
import { pageMetadata } from "@/app/lib/metadata";
import Button from "@/app/ui/Button";

export const metadata = pageMetadata("profile");

const ResetPasswordSuccess = () => (
  <PageColumn className="flex flex-col gap-4">
    <h1 className="text-4xl font-bold">Password Changed</h1>
    <div>Your password has been changed. Sign in with your new password.</div>
    <div className="py-5">
      <Button type="link" linkProps={{ href: "/signin" }} size="large">
        Sign In
      </Button>
    </div>
  </PageColumn>
);

export default ResetPasswordSuccess;
