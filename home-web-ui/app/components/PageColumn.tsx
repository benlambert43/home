import { ReactNode } from "react";

const PageColumn = ({
  children,
  className = "",
  widthClassName = "xl:w-3/4",
}: {
  children: ReactNode;
  className?: string;
  widthClassName?: string;
}) => (
  <div className={`mx-auto w-full p-5 ${widthClassName} ${className}`}>
    {children}
  </div>
);

export default PageColumn;
