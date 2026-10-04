"use client";

import type { SessionStatus } from "@/app/session/route";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const fetchSignedIn = async () => {
  const response = await fetch("/session");
  const session = (await response.json()) as SessionStatus;

  return session.signedIn;
};

const SessionActions = ({
  signedIn,
  signedOut,
}: Readonly<{ signedIn: ReactNode; signedOut: ReactNode }>) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      const current = await fetchSignedIn();
      if (!active) return;

      setIsSignedIn(current);
    };

    loadSession().catch(() => {
      if (active) setIsSignedIn(false);
    });

    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (isSignedIn === null) return;

    const refreshOnSessionChange = async () => {
      if (document.visibilityState !== "visible") return;

      const current = await fetchSignedIn();
      if (current === isSignedIn) return;

      setIsSignedIn(current);
      router.refresh();
    };

    const onVisibilityChange = () => {
      refreshOnSessionChange().catch(() => undefined);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isSignedIn, router]);

  if (isSignedIn === null) return null;

  return isSignedIn ? signedIn : signedOut;
};

export default SessionActions;
