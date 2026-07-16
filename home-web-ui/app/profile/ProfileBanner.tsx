import { UserCookie } from "@/app/types/types";
import Button from "@/app/ui/Button";
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
            <div className="py-5">
              <Link
                href={
                  "/profile/accountManagement/requestNewEmailVerificationLink"
                }
                className="font-semibold underline"
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
