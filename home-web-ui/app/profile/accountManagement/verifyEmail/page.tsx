import VerificationComplete from "@/app/profile/accountManagement/verifyEmail/VerificationComplete";
import VerificationProblem from "@/app/profile/accountManagement/verifyEmail/VerificationProblem";
import { UserNoPassword, VerifyEmailResponse } from "@home/shared";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";

type VerificationResult =
  | {
      status: "complete";
      message: string;
      session?: { jwt: string; user: UserNoPassword };
    }
  | { status: "failed"; message: string }
  | { status: "missingParams" }
  | { status: "unreachable"; error: string };

const resolveVerification = async (
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>,
): Promise<VerificationResult> => {
  const user = await getBffSessionUser();
  if (user?._id && user.confirmedEmail === true) {
    return { status: "complete", message: "" };
  }

  const { username, email, code } = await searchParams;

  if (!username || !email || !code) {
    return { status: "missingParams" };
  }

  const VERIFICATION_LINK_URL = `${process.env.BASE_API_URL}/accountManagement/verifyEmail/${username}/${email}/${code}`;
  const verificationLinkResponse = await fetch(VERIFICATION_LINK_URL, {
    cache: "no-store",
    next: { revalidate: 0 },
  });
  const verificationStatus: VerifyEmailResponse =
    await verificationLinkResponse.json();

  if (
    verificationStatus.error === false &&
    verificationStatus.message &&
    verificationStatus.jwt &&
    verificationStatus.user
  ) {
    return {
      status: "complete",
      message: verificationStatus.message,
      session: {
        jwt: verificationStatus.jwt,
        user: verificationStatus.user,
      },
    };
  }

  return { status: "failed", message: verificationStatus.message };
};

const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  let result: VerificationResult;

  try {
    result = await resolveVerification(searchParams);
  } catch (e) {
    result = {
      status: "unreachable",
      error: e instanceof Error ? e.toString() : String(e),
    };
  }

  if (result.status === "complete") {
    return (
      <VerificationComplete message={result.message} session={result.session} />
    );
  }

  if (result.status === "missingParams") {
    return (
      <VerificationProblem headline="Missing username, email and/or code." />
    );
  }

  if (result.status === "unreachable") {
    return (
      <VerificationProblem
        headline="An error occurred. Unable to reach email verification service."
        detail={result.error}
      />
    );
  }

  return (
    <VerificationProblem
      headline="An error occurred. Please refresh the page or request a new email verification link."
      detail={result.message}
      showRequestNewLink
    />
  );
};

export default VerifyEmail;
