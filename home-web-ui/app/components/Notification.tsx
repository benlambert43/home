"use client";

import { getNotifications } from "@/app/actions/notifications";
import NotificationIcon from "@/app/components/NotificationIcon";
import { Notification } from "@/app/types/types";
import { createContext, useEffect, useState } from "react";

const defaultNotificationContext = {
  drawer: {
    notificationDrawerOpen: false,
    handleSetNotificationDrawerOpen: () => {},
    handleSetNotificationDrawerClosed: () => {},
  },
  content: {
    notifications: [] as Notification[],
    notificationsRefreshing: false,
    handleRefreshNotifications: () => {},
  },
  stream: {},
};

export const NotificationContext = createContext(defaultNotificationContext);

export const Notifications = () => {
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsRefreshing, setNotificationsRefreshing] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const maybeNotifications = await getNotifications();
      const realNotifications =
        typeof maybeNotifications.notifications !== "undefined"
          ? maybeNotifications.notifications
          : [];
      const updateNotificationsClonedArray = [...realNotifications];
      setNotifications(updateNotificationsClonedArray);
      setNotificationsRefreshing(false);
    };
    fetchNotifications();
  }, [notificationsRefreshing]);

  const handleSetNotificationDrawerOpen = () => {
    setNotificationDrawerOpen(true);
    setNotificationsRefreshing(true);
  };
  const handleSetNotificationDrawerClosed = () => {
    setNotificationDrawerOpen(false);
  };
  const handleRefreshNotifications = () => {
    setNotificationsRefreshing(true);
  };

  return (
    <NotificationContext.Provider
      value={{
        drawer: {
          notificationDrawerOpen,
          handleSetNotificationDrawerClosed,
          handleSetNotificationDrawerOpen,
        },
        content: {
          notifications,
          notificationsRefreshing,
          handleRefreshNotifications,
        },
        stream: {},
      }}
    >
      <NotificationIcon />
    </NotificationContext.Provider>
  );
};
