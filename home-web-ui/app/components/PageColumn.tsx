import { ReactNode } from "react";

const PageColumn = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`mx-auto w-full p-5 xl:w-2/3 ${className}`}>{children}</div>
);

export default PageColumn;
