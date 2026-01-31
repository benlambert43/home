import { MouseEventHandler, ReactNode } from "react";

const Button = (props: {
  children: ReactNode;
  type?: "button" | "reset" | "submit" | undefined;
  disabled?: boolean | undefined;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  className?: string | undefined;
}) => {
  const { children, type, disabled, onClick, className } = props;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={
        className ||
        `w-1/2 max-w-80 min-w-fit rounded-xl bg-slate-500 px-4 py-2 outline-1
        outline-slate-400 hover:cursor-pointer hover:shadow-md
        hover:shadow-slate-500 focus:outline-slate-100`
      }
    >
      {children}
    </button>
  );
};

export default Button;
