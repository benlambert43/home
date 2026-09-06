import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { HTMLAttributeAnchorTarget, MouseEventHandler, ReactNode } from "react";

type ButtonSize = "large" | "small";
type ButtonEmphasis = "primary" | "secondary";
export type ButtonColor = "normal" | "warning" | "danger";

const SIZE_CLASSES: Record<ButtonSize, string> = {
  large: "inline-block rounded-md px-8 py-1 hover:cursor-pointer text-lg",
  small: "inline-block rounded-sm px-2 py-0.5 hover:cursor-pointer text-base",
};

const COLOR_CLASSES: Record<ButtonEmphasis, Record<ButtonColor, string>> = {
  primary: {
    normal: "bg-slate-500 hover:bg-slate-400 focus:outline-slate-100",
    warning: "bg-amber-500 hover:bg-amber-400 focus:outline-amber-100",
    danger: "bg-red-500 hover:bg-red-400 focus:outline-red-100",
  },
  secondary: {
    normal:
      "inset-ring-1 inset-ring-slate-400 text-slate-100 hover:inset-ring-slate-100 hover:bg-slate-700 focus:outline-slate-100",
    warning:
      "inset-ring-1 inset-ring-amber-400 text-amber-100 hover:inset-ring-amber-100 hover:bg-amber-700 focus:outline-amber-100",
    danger:
      "inset-ring-1 inset-ring-red-400 text-red-100 hover:inset-ring-red-100 hover:bg-red-700 focus:outline-red-100",
  },
};

type LinkProps = {
  href: Url;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

type SharedProps = {
  children: ReactNode;
  color?: ButtonColor;
  emphasis?: ButtonEmphasis;
  size?: ButtonSize;
};

type ButtonProps = SharedProps &
  (
    | {
        type?: "button" | "reset" | "submit";
        disabled?: boolean;
        onClick?: MouseEventHandler<HTMLButtonElement>;
      }
    | {
        type: "link";
        linkProps: LinkProps;
      }
  );

const Button = ({
  color = "normal",
  emphasis = "primary",
  ...props
}: ButtonProps) => {
  const { children, size } = props;
  const className = `${size ? SIZE_CLASSES[size] : ""} ${COLOR_CLASSES[emphasis][color]}`;

  if (props.type === "link") {
    const { href, target, rel } = props.linkProps;
    return (
      <Link href={href} target={target} rel={rel} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type}
      disabled={props.disabled}
      onClick={props.onClick}
      className={className}
    >
      {children}
    </button>
  );
};

export default Button;
