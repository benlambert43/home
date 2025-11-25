import { VerifyEmailResponse } from "@/app/types/response";

const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const username = (await searchParams).username;
  const email = (await searchParams).email;
  const code = (await searchParams).code;
  try {
    if (username && email && code) {
      const VERIFICATION_LINK_URL = `${process.env.API_URL}/accountManagement/verifyEmail/${username}/${email}/${code}`;
      const verificationLinkResponse = await fetch(VERIFICATION_LINK_URL, {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      const verificationStatus: VerifyEmailResponse =
        await verificationLinkResponse.json();

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
            <div>{verificationStatus.message}</div>
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
