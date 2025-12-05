"use client";

import { updateSessionTokens } from "@/app/actions/session";
import { UserNoPassword } from "@/app/types/types";
import { redirect } from "next/navigation";
import { useEffect } from "react";

const EmailVerified = (props: {
  verificationStatusMessage: string;
  newToken: string;
  user: UserNoPassword;
}) => {
  const { verificationStatusMessage, newToken, user } = props;

  useEffect(() => {
    const updateTokens = async () => {
      await updateSessionTokens({
        encodedApiJwtSession: newToken,
        user: user,
      }).then(() => {
        redirect("/profile");
      });
    };
    updateTokens();
  }, []);

  return <div className="p-5 py-5">{verificationStatusMessage}</div>;
};

export default EmailVerified;
