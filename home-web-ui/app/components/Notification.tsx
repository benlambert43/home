"use client";

import NotificationDrawer from "@/app/components/NotificationDrawer";
import { BellIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

export const Notifications = () => {
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const handleSetNotificationDrawerOpen = () => {
    setNotificationDrawerOpen(true);
  };
  const handleSetNotificationDrawerClosed = () => {
    setNotificationDrawerOpen(false);
  };

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
      <NotificationDrawer notificationDrawerOpen={notificationDrawerOpen} />
    </>
  );
};
