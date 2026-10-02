"use client";

import {
  completeEmailVerification,
  CompleteEmailVerificationResult,
} from "@/app/actions/auth";
import VerificationProblem from "@/app/profile/accountManagement/verifyEmail/VerificationProblem";
import { useEffect, useRef, useState } from "react";

const VerificationComplete = ({ code }: { code: string }) => {
  const hasStarted = useRef(false);
  const [failure, setFailure] = useState<CompleteEmailVerificationResult>();

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    void completeEmailVerification(code).then(setFailure);
  }, [code]);

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
