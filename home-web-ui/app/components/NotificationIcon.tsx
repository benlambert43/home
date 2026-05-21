import { NotificationContext } from "@/app/components/Notifications";
import NotificationDrawer from "@/app/components/NotificationDrawer";
import { BellIcon } from "@heroicons/react/16/solid";
import { useContext, useEffect, useRef } from "react";

const NotificationIcon = () => {
  const { content, drawer, stream } = useContext(NotificationContext);
  const {
    notificationDrawerOpen,
    handleSetNotificationDrawerClosed,
    handleSetNotificationDrawerOpen,
    handleAnimatedClose,
  } = drawer;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationDrawerOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleAnimatedClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [notificationDrawerOpen, handleAnimatedClose]);

  return (
    <div ref={containerRef} className="flex items-center">
      <button
        className="hover:cursor-pointer"
        onClick={() => {
          if (notificationDrawerOpen) {
            handleSetNotificationDrawerClosed();
          } else {
            handleSetNotificationDrawerOpen();
          }
        }}
      >
        <div className="relative">
          <BellIcon className="size-6" />
          {content.notifications.length > 0 && (
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
