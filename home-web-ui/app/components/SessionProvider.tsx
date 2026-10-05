"use client";

import type { SessionStatus } from "@/app/session/route";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  Suspense,
  useEffect,
  useState,
} from "react";

export const SessionContext = createContext<SessionStatus | null>(null);

const SIGNED_OUT: SessionStatus = { signedIn: false, isAdmin: false };

const fetchSession = async () => {
  const response = await fetch("/session");

  return (await response.json()) as SessionStatus;
};

const sameSession = (first: SessionStatus, second: SessionStatus) =>
  first.signedIn === second.signedIn && first.isAdmin === second.isAdmin;

type SessionLoaderProps = {
  session: SessionStatus | null;
  setSession: Dispatch<SetStateAction<SessionStatus | null>>;
};

const SessionLoader = ({ session, setSession }: SessionLoaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const storeSession = (current: SessionStatus) => {
      setSession((previous) =>
        previous !== null && sameSession(previous, current)
          ? previous
          : current,
      );
    };

    const loadSession = async () => {
      const current = await fetchSession();
      if (!active) return;

      storeSession(current);
    };

    loadSession().catch(() => {
      if (active) storeSession(SIGNED_OUT);
    });

    return () => {
      active = false;
    };
  }, [pathname, setSession]);

  useEffect(() => {
    if (session === null) return;

    const refreshOnSessionChange = async () => {
      if (document.visibilityState !== "visible") return;

      const current = await fetchSession();
      if (sameSession(current, session)) return;

      setSession(current);
      router.refresh();
    };

    const onVisibilityChange = () => {
      refreshOnSessionChange().catch(() => undefined);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [session, setSession, router]);

  return null;
};

const SessionProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  const [session, setSession] = useState<SessionStatus | null>(null);

  return (
    <SessionContext value={session}>
      <Suspense fallback={null}>
        <SessionLoader session={session} setSession={setSession} />
      </Suspense>
      {children}
    </SessionContext>
  );
};

export default SessionProvider;
