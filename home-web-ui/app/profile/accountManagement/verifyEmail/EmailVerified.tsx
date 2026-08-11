"use client";

import { updateSessionTokens } from "@/app/actions/session";
import { UserNoPassword } from "@home/shared";
import { redirect } from "next/navigation";
import { useEffect } from "react";

const EmailVerified = (props: {
  verificationStatusMessage: string;
  jwt: string;
  user: UserNoPassword;
}) => {
  const { verificationStatusMessage, jwt, user } = props;

  useEffect(() => {
    const updateTokens = async () => {
      await updateSessionTokens({
        encodedApiJwtSession: jwt,
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
