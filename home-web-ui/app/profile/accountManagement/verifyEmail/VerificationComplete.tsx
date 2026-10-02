"use client";

import {
  completeEmailVerification,
  CompleteEmailVerificationResult,
} from "@/app/actions/auth";
import VerificationProblem from "@/app/profile/accountManagement/verifyEmail/VerificationProblem";
import { startTransition, useActionState, useEffect, useRef } from "react";

const VerificationComplete = ({ code }: { code: string }) => {
  const hasStarted = useRef(false);
  const [failure, verify] = useActionState<
    CompleteEmailVerificationResult | undefined
  >(() => completeEmailVerification(code), undefined);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    startTransition(verify);
  }, [verify]);

  if (failure?.unreachable) {
    return (
      <VerificationProblem
        headline="An error occurred. Unable to reach email verification service."
        detail={failure.message}
      />
    );
  }

  if (failure) {
    return (
      <VerificationProblem
        headline="An error occurred. Please refresh the page or request a new email verification link."
        detail={failure.message}
        showRequestNewLink
      />
    );
  }

  return <div className="p-5 py-5">Verifying your email...</div>;
};

export default VerificationComplete;
