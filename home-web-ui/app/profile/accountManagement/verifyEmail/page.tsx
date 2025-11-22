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
        next: { revalidate: 0 },
      });
      const verificationStatus: VerifyEmailResponse =
        await verificationLinkResponse.json();

      return (
        <div className="p-5">
          <div>Verify Email</div>
          <div>
            {username} {email} {code}
          </div>
          <div>{JSON.stringify(verificationStatus)}</div>
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
