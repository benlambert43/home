import "server-only";
import { connection } from "next/server";
import { Fragment, ReactNode } from "react";

const RemountOnEveryVisit = async ({ children }: { children: ReactNode }) => {
  await connection();

  return <Fragment key={crypto.randomUUID()}>{children}</Fragment>;
};

export default RemountOnEveryVisit;
