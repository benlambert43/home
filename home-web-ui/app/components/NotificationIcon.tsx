import { NotificationContext } from "@/app/components/Notification";
import NotificationDrawer from "@/app/components/NotificationDrawer";
import { BellIcon } from "@heroicons/react/16/solid";
import { useContext } from "react";

const NotificationIcon = () => {
  const { content, drawer, stream } = useContext(NotificationContext);
  const {
    notificationDrawerOpen,
    handleSetNotificationDrawerClosed,
    handleSetNotificationDrawerOpen,
  } = drawer;

  return (
    <>
      <button
        className={"hover:cursor-pointer"}
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
          <span
            className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full
              bg-red-500"
          />
        </div>
      </button>
      <NotificationDrawer />
    </>
  );
};

export default NotificationIcon;
