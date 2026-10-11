"use client";

import { NotificationContext } from "@/app/components/Notifications";
import NotificationDrawer from "@/app/components/NotificationDrawer";
import UnreadBadge from "@/app/components/UnreadBadge";
import { NAV_ICON_LINK_CLASSES } from "@/app/ui/navStyles";
import { BellIcon } from "@heroicons/react/16/solid";
import {
  FocusEvent,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";

const NotificationIcon = () => {
  const { hasUnread, drawer } = useContext(NotificationContext);
  const { open, toggle, close } = drawer;
  const drawerId = useId();

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeAndRefocus = useCallback(() => {
    close();
    buttonRef.current?.focus();
  }, [close]);

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

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndRefocus();
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close, closeAndRefocus]);

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (
      open &&
      e.relatedTarget instanceof Node &&
      !e.currentTarget.contains(e.relatedTarget)
    ) {
      close();
    }
  };

  return (
    <div ref={containerRef} className="flex items-center" onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={hasUnread ? "Notifications (unread)" : "Notifications"}
        aria-expanded={open}
        aria-controls={open ? drawerId : undefined}
        className={`${NAV_ICON_LINK_CLASSES} hover:cursor-pointer`}
        onClick={toggle}
      >
        <UnreadBadge>
          <BellIcon className="size-6" />
        </UnreadBadge>
      </button>
      <NotificationDrawer id={drawerId} onClose={closeAndRefocus} />
    </div>
  );
};

export default NotificationIcon;
