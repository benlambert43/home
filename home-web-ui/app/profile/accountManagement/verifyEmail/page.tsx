import EmailAlreadyVerified from "@/app/profile/accountManagement/verifyEmail/EmailAlreadyVerified";
import EmailVerified from "@/app/profile/accountManagement/verifyEmail/EmailVerified";
import { VerifyEmailResponse } from "@/app/types/response";
import { cookies } from "next/headers";

const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  try {
    // If the user cookie already exists and the confirmed email is true then skip the fetch call.
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    if (
      userCookie &&
      JSON.parse(userCookie.value)?._id &&
      JSON.parse(userCookie.value)?.confirmedEmail === true
    ) {
      return <EmailAlreadyVerified />;
    } else {
      const username = (await searchParams).username;
      const email = (await searchParams).email;
      const code = (await searchParams).code;

      if (username && email && code) {
        const VERIFICATION_LINK_URL = `${process.env.API_URL}/accountManagement/verifyEmail/${username}/${email}/${code}`;
        const verificationLinkResponse = await fetch(VERIFICATION_LINK_URL, {
          cache: "no-store",
          next: { revalidate: 0 },
        });
        const verificationStatus: VerifyEmailResponse =
          await verificationLinkResponse.json();

        // if the response from the server is good, then run the client component to update the cookies on the client.
        // returns early and redirects to /profile
        if (
          verificationStatus.error === false &&
          verificationStatus.message &&
          verificationStatus.newToken &&
          verificationStatus.user
        ) {
          return (
            <EmailVerified
              verificationStatusMessage={verificationStatus.message}
              newToken={verificationStatus.newToken}
              user={verificationStatus.user}
            />
          );
        }

        return (
          <div className="p-5">
            {verificationStatus.error ? (
              <div>
                <div className="py-5">
                  An error occurred. Please refresh the page or request a new
                  email verification link.
                </div>
                <div className="py-5">
                  <p className="font-mono text-xs">
                    {JSON.stringify(verificationStatus)}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div>{verificationStatus.message}</div>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="p-5">
            <div>Missing username, email and/or code.</div>
          </div>
        );
      }
    }
  } catch (e) {
    return (
      <div className="p-5">
        <div>
          An error occurred. Unable to reach email verification service.
        </div>
        <div>{e?.toString()}</div>
      </div>
    );
  }
};

export default VerifyEmail;
