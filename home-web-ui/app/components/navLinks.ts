import {
  ArrowRightEndOnRectangleIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  NewspaperIcon,
  Squares2X2Icon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";
import { ComponentType } from "react";

export type NavLink = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

export const NAV_LINKS: NavLink[] = [
  { href: "/blog", label: "blog", Icon: NewspaperIcon },
  { href: "/projects", label: "projects", Icon: Squares2X2Icon },
  { href: "/about", label: "about", Icon: InformationCircleIcon },
];

export const SIGN_IN_LINK: NavLink = {
  href: "/signin",
  label: "sign in",
  Icon: ArrowRightEndOnRectangleIcon,
};

export const SETTINGS_LINK: NavLink = {
  href: "/settings",
  label: "settings",
  Icon: Cog6ToothIcon,
};

export const PROFILE_LINK: NavLink = {
  href: "/profile",
  label: "profile",
  Icon: UserCircleIcon,
};

export const ACCOUNT_LINKS = [SETTINGS_LINK, PROFILE_LINK];
