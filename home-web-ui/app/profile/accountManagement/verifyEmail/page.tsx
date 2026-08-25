import VerificationComplete from "@/app/profile/accountManagement/verifyEmail/VerificationComplete";
import VerificationProblem from "@/app/profile/accountManagement/verifyEmail/VerificationProblem";
import { SessionPayload } from "@home/shared";
import { getBffSessionUser } from "@/app/auth/getBffSessionUser";
import { verifyEmail } from "@/app/actions/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type VerificationResult =
  | { status: "complete"; message?: string; session?: SessionPayload }
  | { status: "failed"; message: string }
  | { status: "missingParams" }
  | { status: "unreachable"; error: string };

const paramFilled = (value: string | string[] | undefined): value is string =>
  typeof value === "string" && value.length > 0;

const resolveVerification = async (
  searchParams: SearchParams,
): Promise<VerificationResult> => {
  const user = await getBffSessionUser();
  if (user?._id && user.confirmedEmail === true) {
    return { status: "complete" };
  }

  const { username, email, code } = await searchParams;

  if (!paramFilled(username) || !paramFilled(email) || !paramFilled(code)) {
    return { status: "missingParams" };
  }

  const verificationStatus = await verifyEmail(username, email, code);

  if (verificationStatus.error) {
    return { status: "failed", message: verificationStatus.message };
  }

  const { message, jwt, user: verifiedUser } = verificationStatus;
  return { status: "complete", message, session: { jwt, user: verifiedUser } };
};

const VerifyEmail = async ({
  searchParams,
}: {
  searchParams: SearchParams;
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
