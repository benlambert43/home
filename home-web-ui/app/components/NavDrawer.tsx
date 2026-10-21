"use client";

import Dialog from "@/app/components/Dialog";
import GuardedLink from "@/app/components/GuardedLink";
import NavDrawerNotifications from "@/app/components/NavDrawerNotifications";
import {
  ACCOUNT_LINKS,
  NAV_LINKS,
  NavLink,
  SIGN_IN_LINK,
} from "@/app/components/navLinks";
import { NotificationContext } from "@/app/components/Notifications";
import SessionActions from "@/app/components/SessionActions";
import UnreadBadge from "@/app/components/UnreadBadge";
import icon from "@/app/icon.png";
import {
  NAV_DRAWER_LINK_CLASSES,
  NAV_ICON_LINK_CLASSES,
  NAV_TEXT_LINK_CLASSES,
} from "@/app/ui/navStyles";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 40rem)";

const SECTION_CLASSES = "-mx-3 flex flex-col gap-1";

const ACCOUNT_SECTION_CLASSES = `${SECTION_CLASSES} border-t border-slate-600 pt-4`;

const CURRENT_LINK_CLASSES = `${NAV_DRAWER_LINK_CLASSES} bg-slate-50/15 hover:bg-slate-50/20 focus-visible:bg-slate-50/20`;

const isCurrentPath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

type DrawerLinkProps = NavLink & {
  pathname: string;
  onNavigate: () => void;
};

const DrawerLink = ({
  href,
  label,
  Icon,
  pathname,
  onNavigate,
}: DrawerLinkProps) => {
  const current = isCurrentPath(pathname, href);

  return (
    <GuardedLink
      href={href}
      aria-current={current ? "page" : undefined}
      className={current ? CURRENT_LINK_CLASSES : NAV_DRAWER_LINK_CLASSES}
      onNavigate={onNavigate}
    >
      <Icon className="size-6" />
      {label}
    </GuardedLink>
  );
};

const NavDrawer = () => {
  const { hasUnread, refresh } = useContext(NotificationContext);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);

  if (open && openedOn !== pathname) {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const desktop = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const closeOnDesktop = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };

    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open]);

  const show = () => {
    setOpenedOn(pathname);
    setOpen(true);
    refresh();
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={
          hasUnread
            ? "Open navigation menu (unread notifications)"
            : "Open navigation menu"
        }
        className={`${NAV_ICON_LINK_CLASSES} hover:cursor-pointer sm:hidden`}
        onClick={show}
      >
        <UnreadBadge>
          <Bars3Icon className="size-6" />
        </UnreadBadge>
      </button>
      <Dialog
        open={open}
        onClose={close}
        label="Navigation menu"
        placement="start"
      >
        <div
          className="flex w-72 max-w-[85vw] flex-col gap-6 rounded-r-2xl
            bg-slate-700 pt-8 pr-6 pb-6 pl-8 shadow-xl"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Image
                src={icon}
                alt=""
                loading="eager"
                width={24}
                height={24}
                className="size-6 rounded-full"
              />
              <GuardedLink
                href="/"
                className={NAV_TEXT_LINK_CLASSES}
                onNavigate={close}
              >
                benlambert.tech
              </GuardedLink>
            </div>
            <button
              type="button"
              aria-label="Close navigation menu"
              className={`${NAV_ICON_LINK_CLASSES} hover:cursor-pointer`}
              onClick={close}
            >
              <XMarkIcon className="size-6" />
            </button>
          </div>
          <div className={SECTION_CLASSES}>
            {NAV_LINKS.map((link) => (
              <DrawerLink
                key={link.href}
                {...link}
                pathname={pathname}
                onNavigate={close}
              />
            ))}
          </div>
          <SessionActions
            signedOut={
              <div className={ACCOUNT_SECTION_CLASSES}>
                <DrawerLink
                  {...SIGN_IN_LINK}
                  pathname={pathname}
                  onNavigate={close}
                />
              </div>
            }
            signedIn={
              <div className={ACCOUNT_SECTION_CLASSES}>
                <NavDrawerNotifications onNavigate={close} />
                {ACCOUNT_LINKS.map((link) => (
                  <DrawerLink
                    key={link.href}
                    {...link}
                    pathname={pathname}
                    onNavigate={close}
                  />
                ))}
              </div>
            }
          />
        </div>
      </Dialog>
    </>
  );
};

export default NavDrawer;
