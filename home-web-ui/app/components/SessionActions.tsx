"use client";

import { SessionContext } from "@/app/components/SessionProvider";
import { ReactNode, useContext } from "react";

const SessionActions = ({
  signedIn,
  signedOut,
}: Readonly<{ signedIn: ReactNode; signedOut: ReactNode }>) => {
  const session = useContext(SessionContext);

  if (session === null) return null;

  return session.signedIn ? signedIn : signedOut;
};

export default SessionActions;
