import { ReactNode } from "react";

const PassthroughLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div>{children}</div>
);

export default PassthroughLayout;
