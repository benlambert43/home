import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { HTMLAttributeAnchorTarget, MouseEventHandler, ReactNode } from "react";

type ButtonSize = "large" | "medium" | "small";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  large: `w-1/2 max-w-80 min-w-fit rounded-xl bg-slate-500 px-4 py-2
    hover:cursor-pointer hover:bg-slate-400 focus:outline-slate-100`,
  medium: "",
  small: `w-1/2 max-w-60 min-w-fit rounded-md bg-slate-500 px-1 py-0.5
    hover:cursor-pointer hover:bg-slate-400 focus:outline-slate-100`,
};

type LinkProps = {
  href: Url;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

type SharedProps = {
  children: ReactNode;
  size?: ButtonSize;
  className?: string;
};

type ButtonProps = SharedProps &
  (
    | {
        type?: "button" | "reset" | "submit";
        disabled?: boolean;
        onClick?: MouseEventHandler<HTMLButtonElement>;
      }
    | { type: "link"; linkProps: LinkProps }
  );

const Button = (props: ButtonProps) => {
  const { children, size, className } = props;
  const evalClassName = className ?? (size ? SIZE_CLASSES[size] : "");

  if (props.type === "link") {
    const { href, target, rel } = props.linkProps;
    return (
      <Link href={href} target={target} rel={rel} className={evalClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type}
      disabled={props.disabled}
      onClick={props.onClick}
      className={evalClassName}
    >
      {children}
    </button>
  );
};

export default Button;
