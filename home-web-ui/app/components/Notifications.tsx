"use client";

import { getNotifications } from "@/app/actions/notifications";
import NotificationIcon from "@/app/components/NotificationIcon";
import { Notification } from "@home/shared";
import { createContext, useCallback, useEffect, useState } from "react";

type NotificationContextValue = {
  drawer: {
    notificationDrawerOpen: boolean;
    isClosing: boolean;
    handleSetNotificationDrawerOpen: () => void;
    handleSetNotificationDrawerClosed: () => void;
    handleAnimatedClose: () => void;
  };
  content: {
    notifications: Notification[];
    notificationsRefreshing: boolean;
    handleRefreshNotifications: () => void;
  };
};

const defaultNotificationContext: NotificationContextValue = {
  drawer: {
    notificationDrawerOpen: false,
    isClosing: false,
    handleSetNotificationDrawerOpen: () => {},
    handleSetNotificationDrawerClosed: () => {},
    handleAnimatedClose: () => {},
  },
  content: {
    notifications: [],
    notificationsRefreshing: false,
    handleRefreshNotifications: () => {},
  },
};

export const NotificationContext = createContext(defaultNotificationContext);

const CLOSE_ANIMATION_MS = 200;

export const Notifications = () => {
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsRefreshing, setNotificationsRefreshing] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      setNotificationsRefreshing(true);
      const result = await getNotifications();
      if (!active) return;

      setNotifications(result.error ? [] : result.notifications);
      setNotificationsRefreshing(false);
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, [refreshCount]);

  const handleRefreshNotifications = useCallback(
    () => setRefreshCount((count) => count + 1),
    [],
  );

  const handleSetNotificationDrawerOpen = () => {
    setNotificationDrawerOpen(true);
    handleRefreshNotifications();
  };
  const handleSetNotificationDrawerClosed = () => {
    setNotificationDrawerOpen(false);
  };
  const handleAnimatedClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setNotificationDrawerOpen(false);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);
  };

  return (
    <NotificationContext.Provider
      value={{
        drawer: {
          notificationDrawerOpen,
          isClosing,
          handleSetNotificationDrawerClosed,
          handleSetNotificationDrawerOpen,
          handleAnimatedClose,
        },
        content: {
          notifications,
          notificationsRefreshing,
          handleRefreshNotifications,
        },
      }}
    >
      <NotificationIcon />
    </NotificationContext.Provider>
  );
};
