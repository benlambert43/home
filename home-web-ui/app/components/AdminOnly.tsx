"use client";

import { SessionContext } from "@/app/components/SessionProvider";
import { ReactNode, useContext } from "react";

const AdminOnly = ({ children }: Readonly<{ children: ReactNode }>) => {
  const session = useContext(SessionContext);

  return session?.isAdmin ? children : null;
};

export default AdminOnly;
