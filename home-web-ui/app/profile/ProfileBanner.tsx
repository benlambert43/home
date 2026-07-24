import { UserCookie } from "@/app/types/types";
import { ArrowRightIcon, EnvelopeIcon } from "@heroicons/react/16/solid";

import Link from "next/link";

const ProfileBanner = (props: { userCookie: UserCookie }) => {
  return (
    <>
      {props.userCookie.confirmedEmail === false && (
        <div className="max-w-80 rounded-md border-2 p-4">
          <div>
            Email is not yet confirmed. Please check your inbox or resend the
            verification email.
          </div>
          <div>
            <div className="flex flex-col gap-3 pt-6">
              <Link
                href={"http://google.com/gmail"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <EnvelopeIcon className="size-6" />
                Open Gmail
              </Link>
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
        </div>
      )}
    </>
  );
};

export default ProfileBanner;
