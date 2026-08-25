import { ReactNode } from "react";

const Content = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div className="flex items-start justify-around">{children}</div>
);

export default Content;
