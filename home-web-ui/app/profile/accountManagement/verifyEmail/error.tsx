"use client";

import { SERVICE_UNAVAILABLE_MESSAGE } from "@/app/lib/messages";
import VerificationProblem from "@/app/profile/accountManagement/verifyEmail/VerificationProblem";

const VerifyEmailError = () => (
  <VerificationProblem
    headline="An error occurred. Unable to reach email verification service."
    detail={SERVICE_UNAVAILABLE_MESSAGE}
  />
);

export default VerifyEmailError;
