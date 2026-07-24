import { Url } from "next/dist/shared/lib/router/router";
import Link from "next/link";
import { HTMLAttributeAnchorTarget, MouseEventHandler, ReactNode } from "react";

type LinkProps = {
  href: Url;
  target?: HTMLAttributeAnchorTarget | undefined;
  rel?: string | undefined;
};

const Button = (props: {
  children: ReactNode;
  type?: "button" | "reset" | "submit" | "link" | undefined;
  linkProps?: LinkProps;
  size?: "large" | "medium" | "small";
  disabled?: boolean | undefined;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  className?: string | undefined;
}) => {
  const { children, type, linkProps, size, disabled, onClick, className } =
    props;

  const evalClassName =
    className || size === "large"
      ? `w-1/2 max-w-80 min-w-fit rounded-xl bg-slate-500 px-4 py-2
            hover:cursor-pointer hover:bg-slate-400 focus:outline-slate-100`
      : size === "medium"
        ? ""
        : size === "small"
          ? `w-1/2 max-w-60 min-w-fit rounded-md bg-slate-500 px-1 py-0.5
              hover:cursor-pointer hover:bg-slate-400 focus:outline-slate-100`
          : "";

  if (
    type === "button" ||
    type === "submit" ||
    type === "reset" ||
    type === undefined
  ) {
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={evalClassName}
      >
        {children}
      </button>
    );
  } else if (type === "link" && linkProps?.href) {
    return (
      <Link
        href={linkProps?.href}
        target={linkProps?.target}
        rel={linkProps.rel}
        className={evalClassName}
      >
        {children}
      </Link>
    );
  } else {
    return <></>;
  }
};

export default Button;
