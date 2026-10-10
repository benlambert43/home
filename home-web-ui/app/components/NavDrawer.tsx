"use client";

import Dialog from "@/app/components/Dialog";
import NavDrawerNotifications from "@/app/components/NavDrawerNotifications";
import {
  ACCOUNT_LINKS,
  NAV_LINKS,
  SIGN_IN_LINK,
} from "@/app/components/navLinks";
import { NotificationContext } from "@/app/components/Notifications";
import SessionActions from "@/app/components/SessionActions";
import UnreadBadge from "@/app/components/UnreadBadge";
import {
  NAV_DRAWER_LINK_CLASSES,
  NAV_ICON_LINK_CLASSES,
  NAV_TEXT_LINK_CLASSES,
} from "@/app/ui/navStyles";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 40rem)";

const SECTION_CLASSES = "-mx-3 flex flex-col gap-1";

const ACCOUNT_SECTION_CLASSES = `${SECTION_CLASSES} border-t border-slate-600 pt-4`;

const NavDrawer = () => {
  const { hasUnread, refresh } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);

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
    setOpen(true);
    refresh();
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
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
          className="flex w-72 max-w-[85vw] -translate-x-full flex-col gap-6
            bg-slate-700 p-6 shadow-xl transition-transform duration-200
            ease-out group-open:translate-x-0
            starting:group-open:-translate-x-full"
        >
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className={NAV_TEXT_LINK_CLASSES} onClick={close}>
              benlambert.tech
            </Link>
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
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={NAV_DRAWER_LINK_CLASSES}
                onClick={close}
              >
                {label}
              </Link>
            ))}
          </div>
          <SessionActions
            signedOut={
              <div className={ACCOUNT_SECTION_CLASSES}>
                <Link
                  href={SIGN_IN_LINK.href}
                  className={NAV_DRAWER_LINK_CLASSES}
                  onClick={close}
                >
                  {SIGN_IN_LINK.label}
                </Link>
              </div>
            }
            signedIn={
              <div className={ACCOUNT_SECTION_CLASSES}>
                <NavDrawerNotifications onNavigate={close} />
                {ACCOUNT_LINKS.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={NAV_DRAWER_LINK_CLASSES}
                    onClick={close}
                  >
                    <Icon className="size-6" />
                    {label}
                  </Link>
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
