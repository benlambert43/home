import "server-only";
import { Fragment, ReactNode } from "react";

const RemountOnEveryVisit = ({ children }: { children: ReactNode }) => (
  <Fragment key={crypto.randomUUID()}>{children}</Fragment>
);

export default RemountOnEveryVisit;
