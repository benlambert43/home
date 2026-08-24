"use client";

import { updateSessionTokens } from "@/app/actions/session";
import { SessionPayload } from "@home/shared";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";

const VerificationComplete = (props: {
  message: string;
  session?: SessionPayload;
}) => {
  const { message, session } = props;
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;

    const complete = async () => {
      if (session) {
        await updateSessionTokens({
          encodedApiJwtSession: session.jwt,
          user: session.user,
        });
      }
      redirect("/profile");
    };
    complete();
  }, [session]);

  return <div className="p-5 py-5">{message}</div>;
};

export default VerificationComplete;
