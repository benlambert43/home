import { ReactNode } from "react";

const Content = ({ children }: Readonly<{ children: ReactNode }>) => (
  <div
    className="flex flex-col-reverse gap-8 px-4 *:max-w-120 md:flex-row
      md:items-start md:justify-around md:*:flex-1"
  >
    {children}
  </div>
);

export default Content;
