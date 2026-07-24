import { MouseEventHandler, ReactNode } from "react";

const Button = (props: {
  children: ReactNode;
  type?: "button" | "reset" | "submit" | undefined;
  size?: "large" | "medium" | "small";
  disabled?: boolean | undefined;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  className?: string | undefined;
}) => {
  const { children, type, size, disabled, onClick, className } = props;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={
        className || size === "large"
          ? `w-1/2 max-w-80 min-w-fit rounded-xl bg-slate-500 px-4 py-2
            hover:cursor-pointer hover:bg-slate-400 focus:outline-slate-100`
          : size === "medium"
            ? ""
            : `className="flex focus:outline-slate-100" gap-x-2 rounded-sm
              bg-slate-500 px-2 py-1 hover:cursor-pointer hover:bg-slate-400`
      }
    >
      {children}
    </button>
  );
};

export default Button;
