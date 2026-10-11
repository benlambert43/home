import { NotificationContext } from "@/app/components/Notifications";
import { ReactNode, useContext } from "react";

const UnreadBadge = ({ children }: Readonly<{ children: ReactNode }>) => {
  const { hasUnread } = useContext(NotificationContext);

  return (
    <span className="relative block">
      {children}
      {hasUnread && (
        <span
          aria-hidden
          className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full
            bg-red-500"
        />
      )}
    </span>
  );
};

export default UnreadBadge;
