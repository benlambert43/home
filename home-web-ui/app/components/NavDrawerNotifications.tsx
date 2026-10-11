import NotificationList from "@/app/components/NotificationList";
import { NotificationContext } from "@/app/components/Notifications";
import UnreadBadge from "@/app/components/UnreadBadge";
import { NAV_DRAWER_LINK_CLASSES } from "@/app/ui/navStyles";
import { BellIcon } from "@heroicons/react/16/solid";
import { useContext, useId, useState } from "react";

const NavDrawerNotifications = ({ onNavigate }: { onNavigate: () => void }) => {
  const { hasUnread } = useContext(NotificationContext);
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-label={hasUnread ? "Notifications (unread)" : "Notifications"}
        className={`${NAV_DRAWER_LINK_CLASSES} w-full text-left
          hover:cursor-pointer`}
        onClick={() => setExpanded((value) => !value)}
      >
        <UnreadBadge>
          <BellIcon className="size-6" />
        </UnreadBadge>
        notifications
      </button>
      {expanded && (
        <div id={listId} className="px-3 pt-1 pb-2">
          <NotificationList onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
};

export default NavDrawerNotifications;
