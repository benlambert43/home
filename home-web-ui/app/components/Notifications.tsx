"use client";

import { getNotifications } from "@/app/actions/notifications";
import { SessionContext } from "@/app/components/SessionProvider";
import { Notification } from "@home/shared";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type NotificationContextValue = {
  drawer: {
    open: boolean;
    isClosing: boolean;
    toggle: () => void;
    close: () => void;
  };
  notifications: Notification[];
  hasUnread: boolean;
  refresh: () => void;
};

const defaultNotificationContext: NotificationContextValue = {
  drawer: {
    open: false,
    isClosing: false,
    toggle: () => {},
    close: () => {},
  },
  notifications: [],
  hasUnread: false,
  refresh: () => {},
};

export const NotificationContext = createContext(defaultNotificationContext);

const CLOSE_ANIMATION_MS = 200;

export const Notifications = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const session = useContext(SessionContext);
  const signedIn = session?.signedIn ?? false;
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [loaded, setLoaded] = useState<Notification[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!signedIn) return;

    let active = true;

    const loadNotifications = async () => {
      const result = await getNotifications();
      if (!active) return;

      setLoaded(result.error ? [] : result.notifications);
    };

    loadNotifications().catch(() => {
      if (active) setLoaded([]);
    });

    return () => {
      active = false;
    };
  }, [signedIn, refreshCount]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const refresh = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

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
    refresh();
  }, [open, close, refresh]);

  const notifications = signedIn ? loaded : [];
  const hasUnread = notifications.some(
    (notification) => !notification.markedAsRead,
  );

  return (
    <NotificationContext.Provider
      value={{
        drawer: { open, isClosing, toggle, close },
        notifications,
        hasUnread,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
