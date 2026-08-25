import { ReactNode } from "react";

const PassthroughLayout = ({ children }: Readonly<{ children: ReactNode }>) =>
  children;

export default PassthroughLayout;
