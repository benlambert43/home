import { UserCookie } from "@/app/types/types";

const ProfileBanner = (props: { userCookie: UserCookie }) => {
  return (
    <>
      {props.userCookie.confirmedEmail === false && (
        <div className="max-w-80 rounded-md border-2 p-2">
          Email is not yet confirmed. Please check your inbox or resend the
          verification email.
        </div>
      )}
    </>
  );
};

export default ProfileBanner;
