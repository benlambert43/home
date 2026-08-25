import { UserNoPassword } from "@home/shared";
import OpenGmailButton from "@/app/ui/OpenGmailButton";
import Link from "next/link";

const ProfileBanner = ({ user }: { user: UserNoPassword }) => {
  if (user.confirmedEmail) return null;

  return (
    <div className="max-w-80 rounded-md border-2 p-4">
      <div>
        Email is not yet confirmed. Please check your inbox or resend the
        verification email.
      </div>
      <div className="flex flex-col gap-1 py-2">
        <OpenGmailButton />
        <Link
          href="/profile/accountManagement/requestNewEmailVerificationLink"
          className="underline"
        >
          Request a New Link
        </Link>
      </div>
    </div>
  );
};

export default ProfileBanner;
