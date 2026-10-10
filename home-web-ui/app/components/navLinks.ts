import { Cog6ToothIcon, UserCircleIcon } from "@heroicons/react/16/solid";
import { ComponentType } from "react";

export type AccountLink = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

export const NAV_LINKS = [
  { href: "/blog", label: "blog" },
  { href: "/projects", label: "projects" },
  { href: "/about", label: "about" },
];

export const SIGN_IN_LINK = { href: "/signin", label: "sign in" };

export const SETTINGS_LINK: AccountLink = {
  href: "/settings",
  label: "settings",
  Icon: Cog6ToothIcon,
};

export const PROFILE_LINK: AccountLink = {
  href: "/profile",
  label: "profile",
  Icon: UserCircleIcon,
};

export const ACCOUNT_LINKS = [SETTINGS_LINK, PROFILE_LINK];
