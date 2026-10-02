"use client";

import type { SessionStatus } from "@/app/session/route";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const SessionActions = ({
  signedIn,
  signedOut,
  pending,
}: Readonly<{
  signedIn: ReactNode;
  signedOut: ReactNode;
  pending: ReactNode;
}>) => {
  const pathname = usePathname();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const response = await fetch("/session");
      const session = (await response.json()) as SessionStatus;
      if (!active) return;

      setIsSignedIn(session.signedIn);
    };

    loadSession().catch(() => {
      if (active) setIsSignedIn(false);
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  if (isSignedIn === null) return pending;

  return isSignedIn ? signedIn : signedOut;
};

export default SessionActions;
