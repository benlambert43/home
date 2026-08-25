"use client";

import { getNotifications } from "@/app/actions/notifications";
import NotificationIcon from "@/app/components/NotificationIcon";
import { Notification } from "@home/shared";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

type NotificationContextValue = {
  drawer: {
    open: boolean;
    isClosing: boolean;
    toggle: () => void;
    close: () => void;
  };
  notifications: Notification[];
};

const defaultNotificationContext: NotificationContextValue = {
  drawer: {
    open: false,
    isClosing: false,
    toggle: () => {},
    close: () => {},
  },
  notifications: [],
};

export const NotificationContext = createContext(defaultNotificationContext);

const CLOSE_ANIMATION_MS = 200;

export const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      const result = await getNotifications();
      if (!active) return;

      setNotifications(result.error ? [] : result.notifications);
    };

    loadNotifications().catch(() => {
      if (active) setNotifications([]);
    });

    return () => {
      active = false;
    };
  }, [refreshCount]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const close = useCallback(() => {
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      close();
      return;
    }
    setOpen(true);
    setRefreshCount((count) => count + 1);
  }, [open, close]);

  return (
    <NotificationContext.Provider
      value={{ drawer: { open, isClosing, toggle, close }, notifications }}
    >
      <NotificationIcon />
    </NotificationContext.Provider>
  );
};
