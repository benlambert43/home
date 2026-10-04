"use client";

import {
  completeEmailVerification,
  CompleteEmailVerificationResult,
} from "@/app/actions/auth";
import PageColumn from "@/app/components/PageColumn";
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

  return <PageColumn>Verifying your email...</PageColumn>;
};

export default VerificationComplete;
