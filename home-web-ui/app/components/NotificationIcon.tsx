import { NotificationContext } from "@/app/components/Notifications";
import NotificationDrawer from "@/app/components/NotificationDrawer";
import { BellIcon } from "@heroicons/react/16/solid";
import { useContext, useEffect, useRef } from "react";

const NotificationIcon = () => {
  const { notifications, drawer } = useContext(NotificationContext);
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

  const hasUnread = notifications.some(
    (notification) => !notification.markedAsRead,
  );

  return (
    <div ref={containerRef} className="flex items-center">
      <button className="hover:cursor-pointer" onClick={toggle}>
        <div className="relative">
          <BellIcon className="size-6" />
          {hasUnread && (
            <span
              className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full
                bg-red-500"
            />
          )}
        </div>
      </button>
      <NotificationDrawer />
    </div>
  );
};

export default NotificationIcon;
