"use client";

import { NotificationContext } from "@/app/components/Notifications";
import NotificationDrawer from "@/app/components/NotificationDrawer";
import UnreadBadge from "@/app/components/UnreadBadge";
import { NAV_ICON_LINK_CLASSES } from "@/app/ui/navStyles";
import { BellIcon } from "@heroicons/react/16/solid";
import { useContext, useEffect, useRef } from "react";

const NotificationIcon = () => {
  const { hasUnread, drawer } = useContext(NotificationContext);
  const { open, toggle, close } = drawer;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [open, close]);

  return (
    <div ref={containerRef} className="flex items-center">
      <button
        aria-label={hasUnread ? "Notifications (unread)" : "Notifications"}
        className={`${NAV_ICON_LINK_CLASSES} hover:cursor-pointer`}
        onClick={toggle}
      >
        <UnreadBadge>
          <BellIcon className="size-6" />
        </UnreadBadge>
      </button>
      <NotificationDrawer />
    </div>
  );
};

export default NotificationIcon;
