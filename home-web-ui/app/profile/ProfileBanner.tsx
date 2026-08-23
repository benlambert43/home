import { UserNoPassword } from "@home/shared";
import Button from "@/app/ui/Button";
import { EnvelopeIcon } from "@heroicons/react/16/solid";

import Link from "next/link";

const ProfileBanner = (props: { user: UserNoPassword }) => {
  return (
    <>
      {props.user.confirmedEmail === false && (
        <div className="max-w-80 rounded-md border-2 p-4">
          <div>
            Email is not yet confirmed. Please check your inbox or resend the
            verification email.
          </div>
          <div className="flex flex-col gap-1 py-2">
            <Button
              type="link"
              linkProps={{
                href: "http://google.com/gmail",
                target: "_blank",
                rel: "noopener noreferrer",
              }}
              size="small"
            >
              <div className="flex flex-row gap-1">
                <EnvelopeIcon className="size-6" />
                Open Gmail
              </div>
            </Button>

            <Link
              href={
                "/profile/accountManagement/requestNewEmailVerificationLink"
              }
              className="underline"
            >
              Request a New Link
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileBanner;
